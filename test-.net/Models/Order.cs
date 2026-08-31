namespace CommercialManagement.API.Models;

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    
    public decimal TotalHT { get; set; }
    public decimal TotalTTC { get; set; }

    // Foreign Key & Navigation
    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();
}