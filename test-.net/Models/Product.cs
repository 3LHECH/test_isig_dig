namespace CommercialManagement.API.Models;

public class Product
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal UnitPriceHT { get; set; }
    public int StockQuantity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();
}