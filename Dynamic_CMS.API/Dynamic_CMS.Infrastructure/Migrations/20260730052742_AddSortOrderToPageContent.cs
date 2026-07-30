using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dynamic_CMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSortOrderToPageContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "PageContents",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "PageContents");
        }
    }
}
