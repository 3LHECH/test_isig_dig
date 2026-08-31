using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace test_.net.Migrations
{
    /// <inheritdoc />
    public partial class AddProductsAndOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "UnitPriceHT",
                table: "Products",
                type: "TEXT",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(double),
                oldType: "REAL");

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalTTC",
                table: "Orders",
                type: "TEXT",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(double),
                oldType: "REAL");

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalHT",
                table: "Orders",
                type: "TEXT",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(double),
                oldType: "REAL");

            migrationBuilder.AddColumn<int>(
                name: "ClientId1",
                table: "Orders",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitPrice",
                table: "OrderLines",
                type: "TEXT",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(double),
                oldType: "REAL");

            migrationBuilder.AlterColumn<decimal>(
                name: "LineTotal",
                table: "OrderLines",
                type: "TEXT",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(double),
                oldType: "REAL");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ClientId1",
                table: "Orders",
                column: "ClientId1");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderNumber",
                table: "Orders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Clients_ClientId1",
                table: "Orders",
                column: "ClientId1",
                principalTable: "Clients",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Clients_ClientId1",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ClientId1",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_OrderNumber",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ClientId1",
                table: "Orders");

            migrationBuilder.AlterColumn<double>(
                name: "UnitPriceHT",
                table: "Products",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "TEXT",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<double>(
                name: "TotalTTC",
                table: "Orders",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "TEXT",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<double>(
                name: "TotalHT",
                table: "Orders",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "TEXT",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<double>(
                name: "UnitPrice",
                table: "OrderLines",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "TEXT",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<double>(
                name: "LineTotal",
                table: "OrderLines",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "TEXT",
                oldPrecision: 18,
                oldScale: 2);
        }
    }
}
