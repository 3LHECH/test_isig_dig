using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CommercialManagement.API.Models;

namespace CommercialManagement.API.Data.Configurations;

public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(c => c.Email)
            .IsUnique();

        builder.Property(c => c.Password)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.Phone)
            .HasMaxLength(20);

        builder.Property(c => c.Address)
            .HasMaxLength(250);
    }
}