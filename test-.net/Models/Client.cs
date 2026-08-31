namespace CommercialManagement.API.Models;

public class Client
{
    public int Id { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}