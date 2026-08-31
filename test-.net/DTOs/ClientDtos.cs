using System.ComponentModel.DataAnnotations;

namespace CommercialManagement.API.DTOs;

public record ClientResponseDto(
    int Id,
    string LastName,
    string FirstName,
    string Email,
    string Phone,
    string Address,
    DateTime CreatedAt
);

public record CreateClientDto(
    [Required, MaxLength(100)] string LastName,
    [Required, MaxLength(100)] string FirstName,
    [Required, MaxLength(255)] string Password,
    [Required, EmailAddress, MaxLength(150)] string Email,
    [Phone, MaxLength(20)] string Phone,
    [MaxLength(250)] string Address
);

public record UpdateClientDto(
    [Required, MaxLength(100)] string LastName,
    [Required, MaxLength(100)] string FirstName,
    [Required, MaxLength(255)] string Password,
    [Required, EmailAddress, MaxLength(150)] string Email,
    [Phone, MaxLength(20)] string Phone,
    [MaxLength(250)] string Address
);