using CommercialManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommercialManagement.API.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();

        builder.Property(o => o.TotalHT).HasPrecision(18, 2);
        builder.Property(o => o.TotalTTC).HasPrecision(18, 2);

        builder.HasOne(o => o.Client)
            .WithMany()
            .HasForeignKey(o => o.ClientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}