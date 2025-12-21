using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.API.Services;
using System.Security.Claims;
using System.Text;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatbotController : ControllerBase
    {
        private readonly OpenAIService _openAIService;
        private readonly ILogger<ChatbotController> _logger;

        public ChatbotController(OpenAIService openAIService, ILogger<ChatbotController> logger)
        {
            _openAIService = openAIService;
            _logger = logger;
        }

        /// <summary>
        /// Chat endpoint - Processes user messages with search history context
        /// </summary>
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatbotRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var companyId = GetCurrentUserCompanyId();

                // Analyze the message and search history
                var response = await ProcessChatMessage(
                    request.Message,
                    request.SearchHistory,
                    request.ConversationHistory,
                    userId,
                    companyId
                );

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Chat endpoint for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new { 
                    message = "Erreur lors du traitement de votre message", 
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        /// <summary>
        /// Process chat message with context
        /// </summary>
        private async Task<ChatbotResponse> ProcessChatMessage(
            string message,
            string searchHistory,
            string conversationHistory,
            string userId,
            int companyId)
        {
            // Check if OpenAI is enabled
            if (!_openAIService.IsEnabled())
            {
                _logger.LogError("OpenAI service is not enabled or configured. Please configure OpenAI in appsettings.json");
                throw new InvalidOperationException("Le service OpenAI n'est pas configuré. Veuillez configurer votre clé API dans les paramètres.");
            }

            // Use OpenAI API only
            try
            {
                _logger.LogInformation("Using OpenAI to generate response for user {UserId}, company {CompanyId}", userId, companyId);
                
                var aiResponse = await _openAIService.GenerateChatResponseAsync(
                    message,
                    searchHistory,
                    conversationHistory
                );
                
                var response = new ChatbotResponse
                {
                    Message = aiResponse,
                    Suggestions = GenerateSuggestions(searchHistory),
                    RelatedSearches = ExtractRelatedSearches(searchHistory, message)
                };
                
                _logger.LogInformation("OpenAI response generated successfully");
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API for user {UserId}, company {CompanyId}. Message: {Message}", userId, companyId, message);
                throw; // Re-throw to return error to client
            }
        }

        /// <summary>
        /// Generate response based on message and context
        /// </summary>
        private string GenerateResponse(string message, string searchHistory, string conversationHistory)
        {
            var lowerMessage = message.ToLower();
            var response = new StringBuilder();

            // Greeting
            if (lowerMessage.Contains("bonjour") || lowerMessage.Contains("salut") || lowerMessage.Contains("hello"))
            {
                response.AppendLine("Bonjour ! 👋 Je suis votre assistant basé sur votre historique de recherche.");
                response.AppendLine("Je peux vous aider à retrouver des informations que vous avez cherchées précédemment.");
            }
            // History request
            else if (lowerMessage.Contains("historique") || lowerMessage.Contains("recherches") || lowerMessage.Contains("cherché"))
            {
                if (string.IsNullOrWhiteSpace(searchHistory) || searchHistory.Contains("Aucun historique"))
                {
                    response.AppendLine("Vous n'avez pas encore d'historique de recherche.");
                    response.AppendLine("Commencez à chercher dans l'application pour que je puisse vous aider !");
                }
                else
                {
                    response.AppendLine("Voici votre historique de recherche récent :");
                    response.AppendLine("\n" + searchHistory);
                }
            }
            // Search help
            else if (lowerMessage.Contains("rechercher") || lowerMessage.Contains("chercher") || lowerMessage.Contains("trouver"))
            {
                response.AppendLine("Je peux vous aider à retrouver des informations basées sur votre historique.");
                
                if (!string.IsNullOrWhiteSpace(searchHistory) && !searchHistory.Contains("Aucun historique"))
                {
                    response.AppendLine("\nVoici vos recherches récentes :");
                    var recentSearches = searchHistory.Split('\n').Take(5);
                    foreach (var search in recentSearches)
                    {
                        if (!string.IsNullOrWhiteSpace(search))
                            response.AppendLine($"• {search.Trim()}");
                    }
                }
                else
                {
                    response.AppendLine("Utilisez la barre de recherche en haut de l'écran pour commencer.");
                }
            }
            // Help
            else if (lowerMessage.Contains("aide") || lowerMessage.Contains("help") || lowerMessage.Contains("comment"))
            {
                response.AppendLine("Je suis votre assistant intelligent basé sur votre historique de recherche.");
                response.AppendLine("\nJe peux vous aider à :");
                response.AppendLine("• Retrouver vos recherches précédentes");
                response.AppendLine("• Vous suggérer des recherches similaires");
                response.AppendLine("• Répondre à vos questions sur l'application");
                response.AppendLine("\nPosez-moi une question ou demandez-moi votre historique !");
            }
            // Default response with context
            else
            {
                response.AppendLine("Je comprends votre question.");
                
                if (!string.IsNullOrWhiteSpace(searchHistory) && !searchHistory.Contains("Aucun historique"))
                {
                    response.AppendLine("\nBasé sur votre historique de recherche, voici quelques suggestions :");
                    var searches = searchHistory.Split('\n').Take(3);
                    foreach (var search in searches)
                    {
                        if (!string.IsNullOrWhiteSpace(search))
                            response.AppendLine($"• {search.Trim()}");
                    }
                }
                else
                {
                    response.AppendLine("Pour que je puisse mieux vous aider, commencez par utiliser la fonctionnalité de recherche de l'application.");
                }
            }

            return response.ToString();
        }

        /// <summary>
        /// Generate suggestions based on search history
        /// </summary>
        private List<string> GenerateSuggestions(string searchHistory)
        {
            var suggestions = new List<string>();

            if (!string.IsNullOrWhiteSpace(searchHistory) && !searchHistory.Contains("Aucun historique"))
            {
                var searches = searchHistory.Split('\n')
                    .Where(s => !string.IsNullOrWhiteSpace(s) && s.Contains('"'))
                    .Take(3)
                    .Select(s =>
                    {
                        var match = System.Text.RegularExpressions.Regex.Match(s, @"""([^""]+)""");
                        return match.Success ? $"Rechercher \"{match.Groups[1].Value}\"" : null;
                    })
                    .Where(s => s != null);

                suggestions.AddRange(searches);
            }

            if (suggestions.Count == 0)
            {
                suggestions.Add("Voir mon historique de recherche");
                suggestions.Add("Comment utiliser la recherche ?");
                suggestions.Add("Quelles sont mes recherches récentes ?");
            }

            return suggestions;
        }

        /// <summary>
        /// Extract related searches from history
        /// </summary>
        private List<string> ExtractRelatedSearches(string searchHistory, string message)
        {
            var related = new List<string>();
            
            if (string.IsNullOrWhiteSpace(searchHistory) || searchHistory.Contains("Aucun historique"))
                return related;

            var lowerMessage = message.ToLower();
            var searches = searchHistory.Split('\n')
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s =>
                {
                    var match = System.Text.RegularExpressions.Regex.Match(s, @"""([^""]+)""");
                    return match.Success ? match.Groups[1].Value : null;
                })
                .Where(s => s != null && s.ToLower().Contains(lowerMessage))
                .Take(5);

            related.AddRange(searches);

            return related;
        }

        /// <summary>
        /// Get current user ID from JWT token
        /// </summary>
        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value 
                ?? "unknown";
        }

        /// <summary>
        /// Get current user company ID from JWT token
        /// </summary>
        private int GetCurrentUserCompanyId()
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (int.TryParse(companyIdClaim, out int companyId))
            {
                return companyId;
            }
            return 1; // Default company ID
        }
    }

    /// <summary>
    /// Chatbot request model
    /// </summary>
    public class ChatbotRequest
    {
        public string Message { get; set; }
        public string SearchHistory { get; set; }
        public string ConversationHistory { get; set; }
        public string UserId { get; set; }
    }

    /// <summary>
    /// Chatbot response model
    /// </summary>
    public class ChatbotResponse
    {
        public string Message { get; set; }
        public List<string> Suggestions { get; set; } = new List<string>();
        public List<string> RelatedSearches { get; set; } = new List<string>();
    }
}

