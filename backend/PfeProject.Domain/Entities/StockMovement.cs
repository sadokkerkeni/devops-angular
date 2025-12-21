using System;
using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Entities
{
    /// <summary>
    /// Tracks all stock movements (additions, deductions, adjustments) for audit trail
    /// </summary>
    public class StockMovement
    {
        public int Id { get; set; }
        
        // SAP entry being modified
        public int SapId { get; set; }
        public Sap Sap { get; set; }
        
        // Type of movement
        public string MovementType { get; set; } // "Deduction", "Addition", "Adjustment", "Return"
        
        // Quantity tracking
        public int QuantityBefore { get; set; }
        public int QuantityAfter { get; set; }
        public int QuantityChanged { get; set; }
        
        // Reason for movement
        public string Reason { get; set; }
        
        // Optional links to source documents
        public int? PicklistId { get; set; }
        public Picklist? Picklist { get; set; }
        
        public int? ReturnLineId { get; set; }
        public ReturnLine? ReturnLine { get; set; }
        
        // Who made the change
        public int UserId { get; set; }
        public User User { get; set; }
        
        // When it happened
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Company isolation
        public int CompanyId { get; set; }
        public Company Company { get; set; }
    }
}
