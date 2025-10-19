using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;

namespace PfeProject.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<MovementTrace> MovementTraces { get; set; }
        public DbSet<Picklist> Picklists { get; set; }
        public DbSet<PicklistUs> PicklistUsList { get; set; }
        public DbSet<ReturnLine> ReturnLines { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<DetailInventory> DetailInventories { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Line> Lines { get; set; }
        public DbSet<DetailPicklist> DetailPicklists { get; set; }
        public DbSet<Sap> Saps { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ======== COMPANIES ========
            modelBuilder.Entity<Company>(entity =>
            {
                entity.ToTable("Companies");
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Description).HasMaxLength(255);
                entity.Property(c => c.Code).IsRequired().HasMaxLength(50);
                entity.Property(c => c.CreationDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(c => c.UpdateDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(c => c.IsActive).HasDefaultValue(true);
                entity.HasIndex(c => c.Code).IsUnique();
            });

            // ======== USERS ========
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Matricule).IsRequired().HasMaxLength(50);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Password).IsRequired().HasMaxLength(255);
                entity.Property(u => u.CreationDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(u => u.UpdateDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(u => u.State).HasDefaultValue(true);
                entity.Property(u => u.FailedLoginAttempts).HasDefaultValue(0);
                entity.HasIndex(u => u.Matricule).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasOne(u => u.Company).WithMany(c => c.Users).HasForeignKey(u => u.CompanyId).OnDelete(DeleteBehavior.Restrict);
            });

            // ======== ROLES ========
            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("Roles");
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Name).IsRequired().HasMaxLength(255);
                entity.Property(r => r.CreationDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(r => r.UpdateDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(r => r.State).HasDefaultValue(true);
                entity.HasIndex(r => r.Name).IsUnique();
            });

            // ======== USERROLES ========
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.ToTable("UserRoles");
                entity.HasKey(ur => new { ur.UserId, ur.RoleId });
                entity.Property(ur => ur.AssignmentDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(ur => ur.IsActive).HasDefaultValue(true);
                entity.Property(ur => ur.Note).HasMaxLength(500);
                entity.HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
                entity.HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);
                entity.HasOne(ur => ur.AssignedBy).WithMany().HasForeignKey(ur => ur.AssignedById);
            });

            // ======== WAREHOUSES ========
            modelBuilder.Entity<Warehouse>(entity =>
            {
                entity.ToTable("Warehouses");
                entity.HasKey(w => w.Id);
                entity.Property(w => w.Name).IsRequired().HasMaxLength(100);
                entity.Property(w => w.Description).HasMaxLength(255);
                entity.HasOne(w => w.Company).WithMany(c => c.Warehouses).HasForeignKey(w => w.CompanyId).OnDelete(DeleteBehavior.Restrict);
            });

            // ======== LOCATIONS ========
            modelBuilder.Entity<Location>(entity =>
            {
                entity.ToTable("Locations");
                entity.HasKey(l => l.Id);
                entity.Property(l => l.Code).IsRequired().HasMaxLength(100);
                entity.Property(l => l.Description).HasMaxLength(255);
                entity.HasOne(l => l.Warehouse)
                      .WithMany(w => w.Locations)
                      .HasForeignKey(l => l.WarehouseId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ======== STATUS ========
            modelBuilder.Entity<Status>(entity =>
            {
                entity.ToTable("Status");
                entity.HasKey(s => s.Id);
                entity.Property(s => s.Description).IsRequired().HasMaxLength(100);
                entity.HasOne(s => s.Company).WithMany(c => c.Statuses).HasForeignKey(s => s.CompanyId).OnDelete(DeleteBehavior.Restrict);
            });

            // ======== PICKLISTS ========
            modelBuilder.Entity<Picklist>(entity =>
            {
                entity.ToTable("Picklists");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Quantity).HasMaxLength(100);
                entity.Property(p => p.Type).HasMaxLength(100);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(p => p.IsActive).HasDefaultValue(true);
                entity.HasOne(p => p.Company).WithMany(c => c.Picklists).HasForeignKey(p => p.CompanyId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(p => p.Line).WithMany(l => l.Picklists).HasForeignKey(p => p.LineId);
                entity.HasOne(p => p.Status).WithMany(s => s.Picklists).HasForeignKey(p => p.StatusId);
                entity.HasOne(p => p.Warehouse).WithMany(w => w.Picklists).HasForeignKey(p => p.WarehouseId);
            });

            // ======== DETAIL PICKLISTS ========
            modelBuilder.Entity<DetailPicklist>(entity =>
            {
                entity.ToTable("DetailPicklists");
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Emplacement).HasMaxLength(255);
                entity.Property(d => d.Quantite).HasMaxLength(100);
                entity.Property(d => d.IsActive).HasDefaultValue(true);
                entity.HasOne(d => d.Article).WithMany(a => a.DetailPicklists).HasForeignKey(d => d.ArticleId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Picklist).WithMany(p => p.Details).HasForeignKey(d => d.PicklistId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Status).WithMany(s => s.DetailPicklists).HasForeignKey(d => d.StatusId).OnDelete(DeleteBehavior.Restrict);
            });

            // ======== PICKLIST US ========
            modelBuilder.Entity<PicklistUs>(entity =>
            {
                entity.ToTable("PicklistUs");
                entity.HasKey(pu => pu.Id);
                entity.Property(pu => pu.Nom).HasMaxLength(100);
                entity.Property(pu => pu.Quantite);
                entity.Property(pu => pu.Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.HasOne(pu => pu.User).WithMany(u => u.PicklistUsList).HasForeignKey(pu => pu.UserId);
                entity.HasOne(pu => pu.DetailPicklist).WithMany(dp => dp.PicklistUs).HasForeignKey(pu => pu.DetailPicklistId);
                entity.HasOne(pu => pu.Status).WithMany(s => s.PicklistUsList).HasForeignKey(pu => pu.StatusId);
            });

            // ======== ARTICLES ========
            modelBuilder.Entity<Article>(entity =>
            {
                entity.ToTable("Articles");
                entity.HasKey(a => a.Id);
                entity.Property(a => a.CodeProduit).IsRequired().HasMaxLength(100);
                entity.Property(a => a.Designation).IsRequired().HasMaxLength(255);
                entity.Property(a => a.DateAjout).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(a => a.IsActive).HasDefaultValue(true);
                entity.HasOne(a => a.Company).WithMany(c => c.Articles).HasForeignKey(a => a.CompanyId).OnDelete(DeleteBehavior.Restrict);
            });

            // ======== RETURN LINES ========
            modelBuilder.Entity<ReturnLine>(entity =>
            {
                entity.ToTable("ReturnLines");
                entity.HasKey(r => r.Id);
                entity.Property(r => r.UsCode).HasMaxLength(100);
                entity.Property(r => r.Quantite);
                entity.Property(r => r.DateRetour).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.HasOne(r => r.User).WithMany(u => u.ReturnLines).HasForeignKey(r => r.UserId);
                entity.HasOne(r => r.Article).WithMany(a => a.ReturnLines).HasForeignKey(r => r.ArticleId);
                entity.HasOne(r => r.Status).WithMany(s => s.ReturnLines).HasForeignKey(r => r.StatusId);
            });

            // ======== MOVEMENT TRACES ========
            modelBuilder.Entity<MovementTrace>(entity =>
            {
                entity.ToTable("MovementTraces");
                entity.HasKey(mt => mt.Id);
                entity.Property(mt => mt.UsNom).HasMaxLength(100);
                entity.Property(mt => mt.Quantite);
                entity.Property(mt => mt.DateMouvement).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(mt => mt.IsActive) // ✅ gestion soft delete
        .HasDefaultValue(true);

                entity.HasOne(mt => mt.User).WithMany(u => u.MovementTraces).HasForeignKey(mt => mt.UserId);
                entity.HasOne(mt => mt.DetailPicklist).WithMany().HasForeignKey(mt => mt.DetailPicklistId);
            });

            // ======== INVENTORY ========
            modelBuilder.Entity<Inventory>(entity =>
            {
                entity.ToTable("Inventories");
                entity.HasKey(i => i.Id);
                entity.Property(i => i.Name).IsRequired().HasMaxLength(100);
                entity.Property(i => i.Status).HasMaxLength(100);
                entity.Property(i => i.DateInventaire).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.HasOne(i => i.Company).WithMany(c => c.Inventories).HasForeignKey(i => i.CompanyId).OnDelete(DeleteBehavior.Restrict);
            });

            // ======== DETAIL INVENTORY ========
            modelBuilder.Entity<DetailInventory>(entity =>
            {
                entity.ToTable("DetailInventories");
                entity.HasKey(d => d.Id);
                entity.Property(d => d.UsCode).IsRequired().HasMaxLength(100);
                entity.Property(d => d.ArticleCode).IsRequired().HasMaxLength(100);
                entity.HasOne(d => d.User).WithMany(u => u.DetailInventories).HasForeignKey(d => d.UserId);
                entity.HasOne(d => d.Inventory).WithMany(i => i.DetailInventories).HasForeignKey(d => d.InventoryId);
                entity.HasOne(d => d.Location).WithMany().HasForeignKey(d => d.LocationId);
                entity.HasOne(d => d.Sap).WithMany(s => s.DetailInventories).HasForeignKey(d => d.SapId);
                entity.Property(d => d.IsActive).HasDefaultValue(true);

            });

            // ======== LINES ========
            modelBuilder.Entity<Line>(entity =>
            {
                entity.ToTable("Lines");
                entity.HasKey(l => l.Id);
                entity.Property(l => l.Description).HasMaxLength(255);
                entity.Property(l => l.IsActive).HasDefaultValue(true);
                entity.HasOne(l => l.Company).WithMany(c => c.Lines).HasForeignKey(l => l.CompanyId).OnDelete(DeleteBehavior.Restrict);
            });

            // ======== SAP ========
            modelBuilder.Entity<Sap>(entity =>
            {
                entity.ToTable("Saps");
                entity.HasKey(s => s.Id);
                entity.Property(s => s.Article).HasMaxLength(100);
                entity.Property(s => s.UsCode).HasMaxLength(100);
                entity.Property(s => s.Quantite);
                entity.Property(s => s.IsActive).HasDefaultValue(true);
                entity.HasOne(s => s.Company).WithMany(c => c.Saps).HasForeignKey(s => s.CompanyId).OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}