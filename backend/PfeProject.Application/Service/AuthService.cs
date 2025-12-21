using PfeProject.Application.Interfaces;
using PfeProject.Application.Models;
using PfeProject.Application.Models.Invitations;
using PfeProject.Application.Services;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PfeProject.Application.Service
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly ICompanyRepository _companyRepository;
        private readonly JwtService _jwtService;

        public AuthService(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IUserRoleRepository userRoleRepository,
            ICompanyRepository companyRepository,
            JwtService jwtService)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _userRoleRepository = userRoleRepository;
            _companyRepository = companyRepository;
            _jwtService = jwtService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Check if email already exists
            var existingUserByEmail = await _userRepository.GetUserByEmailAsync(request.Email);
            if (existingUserByEmail != null)
                return new AuthResponse { Message = "Email déjà utilisé ❌", Success = false };

            // Check if matricule already exists
            var existingUserByMatricule = await _userRepository.GetUserByMatriculeAsync(request.Matricule);
            if (existingUserByMatricule != null)
                return new AuthResponse { Message = $"Le matricule '{request.Matricule}' est déjà utilisé ❌", Success = false };

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 🏢 Auto-create company for the first user or get existing company
            Company userCompany;
            var isFirstUser = !await _userRepository.AnyUsersExistAsync();

            if (isFirstUser)
            {
                // Create a new company for the first user
                userCompany = new Company
                {
                    Name = $"{request.FirstName} {request.LastName}'s Company",
                    Description = $"Company created for {request.FirstName} {request.LastName}",
                    Code = GenerateCompanyCode(request.Email),
                    CreationDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                };
                await _companyRepository.AddCompanyAsync(userCompany);
            }
            else
            {
                // For now, assign to the first company (you can implement invitation logic later)
                userCompany = await _companyRepository.GetCompanyByIdAsync(1);
                if (userCompany == null)
                    return new AuthResponse { Message = "No company available for registration", Success = false };
            }

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Matricule = request.Matricule,
                Password = hashedPassword,
                CreationDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                State = true,
                ResetPasswordToken = string.Empty,
                ResetTokenExpiration = null,
                CompanyId = userCompany.Id  // 🏢 Set Company relationship
            };

            await _userRepository.AddUserAsync(user);

            // Get the default "User" role (should be created by DataSeeder with CompanyId = 1)
            var defaultRole = await _roleRepository.GetByNameAsync("User");
            if (defaultRole == null)
            {
                // If User role doesn't exist, create it automatically (with CompanyId = 1 for global access)
                Console.WriteLine("[AuthService] Warning: 'User' role not found. Creating it automatically...");
                
                // Get the global company (CompanyId = 1)
                var globalCompany = await _companyRepository.GetCompanyByIdAsync(1);
                if (globalCompany == null)
                {
                    return new AuthResponse 
                    { 
                        Message = "Erreur de configuration système. Veuillez contacter l'administrateur.", 
                        Success = false 
                    };
                }

                // Create the "User" role
                defaultRole = new Role
                {
                    Name = "User",
                    State = true,
                    CompanyId = 1, // Global company
                    CreationDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow
                };

                await _roleRepository.AddRoleAsync(defaultRole);
                Console.WriteLine("[AuthService] 'User' role created successfully");
            }

            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = defaultRole.Id,
                IsActive = true,
                AssignmentDate = DateTime.UtcNow,
                Note = "Rôle par défaut",
                CompanyId = userCompany.Id // 🏢 Set Company relationship
            };

            await _userRoleRepository.AddAsync(userRole);

            return new AuthResponse
            {
                Email = user.Email,
                Role = defaultRole.Name,
                Message = "Inscription réussie ✅",
                Success = true
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetUserWithRolesByEmailAsync(request.Email);
            if (user == null)
                return new AuthResponse { Message = "Email ou mot de passe invalide ❌", Success = false };

            if (user.FailedLoginAttempts >= 5 && user.LastFailedLogin.HasValue &&
                (DateTime.UtcNow - user.LastFailedLogin.Value).TotalMinutes < 10)
            {
                return new AuthResponse { Message = "Compte temporairement bloqué. Réessayez plus tard.", Success = false };
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                user.FailedLoginAttempts++;
                user.LastFailedLogin = DateTime.UtcNow;
                await _userRepository.UpdateUserAsync(user);
                return new AuthResponse { Message = "Email ou mot de passe invalide ❌", Success = false };
            }

            user.FailedLoginAttempts = 0;
            user.LastFailedLogin = null;
            await _userRepository.UpdateUserAsync(user);

            // Debug: Log user and roles
            Console.WriteLine($"[AuthService] User ID: {user.Id}, Email: {user.Email}");
            Console.WriteLine($"[AuthService] UserRoles count: {user.UserRoles?.Count ?? 0}");

            if (user.UserRoles != null && user.UserRoles.Any())
            {
                foreach (var ur in user.UserRoles)
                {
                    Console.WriteLine($"[AuthService] UserRole - UserId: {ur.UserId}, RoleId: {ur.RoleId}, IsActive: {ur.IsActive}, Role: {ur.Role?.Name}");
                }
            }

            // Get all active roles for the user
            var activeRoles = user.UserRoles?
                .Where(ur => ur.IsActive && ur.Role != null)
                .Select(ur => ur.Role.Name)
                .ToList() ?? new List<string>();

            if (!activeRoles.Any())
            {
                Console.WriteLine("[AuthService] No active role found for user");
                return new AuthResponse { Message = "Aucun rôle actif assigné à cet utilisateur ❌", Success = false };
            }

            Console.WriteLine($"[AuthService] Found active roles: {string.Join(", ", activeRoles)}");

            // Use the first role as the primary role for backward compatibility
            var primaryRole = activeRoles.First();
            
            var token = await _jwtService.GenerateToken(user.Id.ToString(), user.Email, activeRoles, user.CompanyId);

            return new AuthResponse
            {
                Email = user.Email,
                Role = primaryRole,
                Token = token,
                Message = "Connexion réussie ✅",
                Success = true
            };
        }

        public async Task<AuthResponse> SendResetPasswordTokenAsync(string email)
        {
            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null)
                return new AuthResponse { Message = "Utilisateur introuvable", Success = false };

            user.ResetPasswordToken = Guid.NewGuid().ToString();
            user.ResetTokenExpiration = DateTime.UtcNow.AddMinutes(15);

            await _userRepository.UpdateUserAsync(user);

            // TODO: envoyer le token par email
            return new AuthResponse { Message = "Token de réinitialisation envoyé", Success = true };
        }

        public async Task<AuthResponse> ResetPasswordAsync(string token, string newPassword)
        {
            Console.WriteLine($"🔍 Tentative de réinitialisation avec le token: {token}");

            var user = await _userRepository.GetUserByResetTokenAsync(token);

            if (user == null || user.ResetTokenExpiration <= DateTime.UtcNow)
            {
                Console.WriteLine("❌ Aucun utilisateur trouvé avec ce token ou le token a expiré.");
                return new AuthResponse { Message = "Token invalide ou expiré", Success = false };
            }

            Console.WriteLine($"✅ Utilisateur trouvé pour reset: {user.Email}");

            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.ResetPasswordToken = string.Empty;
            user.ResetTokenExpiration = null;

            await _userRepository.UpdateUserAsync(user);

            return new AuthResponse { Message = "Mot de passe réinitialisé avec succès", Success = true };
        }

        private string GenerateCompanyCode(string email)
        {
            // Generate a unique company code based on email domain or user info
            var domain = email.Split('@')[1].Split('.')[0].ToUpper();
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
            return $"{domain}_{timestamp}";
        }

        public async Task<AuthResponse> InviteUserToCompanyAsync(InviteUserRequest request)
        {
            // Check if user already exists by email
            var existingUserByEmail = await _userRepository.GetUserByEmailAsync(request.Email);
            if (existingUserByEmail != null)
                return new AuthResponse { Success = false, Message = "User with this email already exists" };

            // Check if matricule already exists
            var existingUserByMatricule = await _userRepository.GetUserByMatriculeAsync(request.Matricule);
            if (existingUserByMatricule != null)
                return new AuthResponse { Success = false, Message = $"Matricule '{request.Matricule}' is already in use" };

            // Verify company exists
            var company = await _companyRepository.GetCompanyByIdAsync(request.CompanyId);
            if (company == null)
                return new AuthResponse { Success = false, Message = "Company not found" };

            // Get the role
            var role = await _roleRepository.GetByNameAsync(request.Role);
            if (role == null)
                return new AuthResponse { Success = false, Message = "Invalid role specified" };

            // Create user directly
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Matricule = request.Matricule,
                Password = hashedPassword,
                CreationDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                State = true,
                ResetPasswordToken = string.Empty,
                ResetTokenExpiration = null,
                CompanyId = request.CompanyId
            };

            await _userRepository.AddUserAsync(user);

            // Assign role
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id,
                IsActive = true,
                AssignmentDate = DateTime.UtcNow,
                Note = "Role assigned via invitation"
            };

            await _userRoleRepository.AddAsync(userRole);

            return new AuthResponse
            {
                Email = user.Email,
                Role = role.Name,
                Message = "User created successfully in company",
                Success = true
            };
        }
    }
}
