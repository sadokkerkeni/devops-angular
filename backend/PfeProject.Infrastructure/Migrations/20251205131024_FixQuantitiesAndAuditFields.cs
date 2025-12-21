using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PfeProject.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixQuantitiesAndAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Inventories");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Status",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            // PostgreSQL requires explicit conversion from text to integer
            migrationBuilder.Sql(
                @"ALTER TABLE ""ReturnLines"" 
                  ALTER COLUMN ""Quantite"" TYPE integer 
                  USING (CASE WHEN ""Quantite"" ~ '^[0-9]+$' THEN ""Quantite""::integer ELSE 0 END);");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "ReturnLines",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "ReturnLines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "ReturnLines",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedAt",
                table: "ReturnLines",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModifiedBy",
                table: "ReturnLines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PicklistId",
                table: "ReturnLines",
                type: "integer",
                nullable: true);

            // PostgreSQL requires explicit conversion from text to integer
            migrationBuilder.Sql(
                @"ALTER TABLE ""Picklists"" 
                  ALTER COLUMN ""Quantity"" TYPE integer 
                  USING (CASE WHEN ""Quantity"" ~ '^[0-9]+$' THEN ""Quantity""::integer ELSE 0 END);");

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "Picklists",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModifiedBy",
                table: "Picklists",
                type: "integer",
                nullable: true);

            // PostgreSQL requires explicit conversion from text to integer
            migrationBuilder.Sql(
                @"ALTER TABLE ""MovementTraces"" 
                  ALTER COLUMN ""Quantite"" TYPE integer 
                  USING (CASE WHEN ""Quantite"" ~ '^[0-9]+$' THEN ""Quantite""::integer ELSE 0 END);");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "MovementTraces",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "MovementTraces",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedAt",
                table: "MovementTraces",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModifiedBy",
                table: "MovementTraces",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Inventories",
                type: "boolean",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Inventories",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "Inventories",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedAt",
                table: "Inventories",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModifiedBy",
                table: "Inventories",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                table: "Inventories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // PostgreSQL requires explicit conversion from text to integer
            migrationBuilder.Sql(
                @"ALTER TABLE ""DetailPicklists"" 
                  ALTER COLUMN ""Quantite"" TYPE integer 
                  USING (CASE WHEN ""Quantite"" ~ '^[0-9]+$' THEN ""Quantite""::integer ELSE 0 END);");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "DetailPicklists",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "DetailPicklists",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedAt",
                table: "DetailPicklists",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModifiedBy",
                table: "DetailPicklists",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StockMovements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SapId = table.Column<int>(type: "integer", nullable: false),
                    MovementType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    QuantityBefore = table.Column<int>(type: "integer", nullable: false),
                    QuantityAfter = table.Column<int>(type: "integer", nullable: false),
                    QuantityChanged = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PicklistId = table.Column<int>(type: "integer", nullable: true),
                    ReturnLineId = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    CompanyId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockMovements_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_Picklists_PicklistId",
                        column: x => x.PicklistId,
                        principalTable: "Picklists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockMovements_ReturnLines_ReturnLineId",
                        column: x => x.ReturnLineId,
                        principalTable: "ReturnLines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockMovements_Saps_SapId",
                        column: x => x.SapId,
                        principalTable: "Saps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReturnLines_PicklistId",
                table: "ReturnLines",
                column: "PicklistId");

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_StatusId",
                table: "Inventories",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_CompanyId",
                table: "StockMovements",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_PicklistId",
                table: "StockMovements",
                column: "PicklistId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ReturnLineId",
                table: "StockMovements",
                column: "ReturnLineId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_SapId",
                table: "StockMovements",
                column: "SapId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_UserId",
                table: "StockMovements",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_Status_StatusId",
                table: "Inventories",
                column: "StatusId",
                principalTable: "Status",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReturnLines_Picklists_PicklistId",
                table: "ReturnLines",
                column: "PicklistId",
                principalTable: "Picklists",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_Status_StatusId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_ReturnLines_Picklists_PicklistId",
                table: "ReturnLines");

            migrationBuilder.DropTable(
                name: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_ReturnLines_PicklistId",
                table: "ReturnLines");

            migrationBuilder.DropIndex(
                name: "IX_Inventories_StatusId",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Status");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "ReturnLines");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "ReturnLines");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "ReturnLines");

            migrationBuilder.DropColumn(
                name: "ModifiedAt",
                table: "ReturnLines");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "ReturnLines");

            migrationBuilder.DropColumn(
                name: "PicklistId",
                table: "ReturnLines");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Picklists");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Picklists");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "MovementTraces");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "MovementTraces");

            migrationBuilder.DropColumn(
                name: "ModifiedAt",
                table: "MovementTraces");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "MovementTraces");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "ModifiedAt",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "DetailPicklists");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DetailPicklists");

            migrationBuilder.DropColumn(
                name: "ModifiedAt",
                table: "DetailPicklists");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "DetailPicklists");

            migrationBuilder.AlterColumn<string>(
                name: "Quantite",
                table: "ReturnLines",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Quantity",
                table: "Picklists",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Quantite",
                table: "MovementTraces",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Inventories",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Inventories",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Quantite",
                table: "DetailPicklists",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
