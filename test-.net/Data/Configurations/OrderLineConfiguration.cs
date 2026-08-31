using CommercialManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommercialManagement.API.Data.Configurations;

public class OrderLineConfiguration : IEntityTypeConfiguration<OrderLine>
{
    public void Configure(EntityTypeBuilder<OrderLine> builder)
    {
        builder.HasKey(ol => ol.Id);

        builder.Property(ol => ol.UnitPrice).HasPrecision(18, 2);
        builder.Property(ol => ol.LineTotal).HasPrecision(18, 2);

        builder.HasOne(ol => ol.Order)
            .WithMany(o => o.OrderLines)
            .HasForeignKey(ol => ol.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ol => ol.Product)
            .WithMany(p => p.OrderLines)
            .HasForeignKey(ol => ol.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}