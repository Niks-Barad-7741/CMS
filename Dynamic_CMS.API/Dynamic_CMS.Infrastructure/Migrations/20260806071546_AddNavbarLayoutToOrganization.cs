using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dynamic_CMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNavbarLayoutToOrganization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NavbarLayout",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NavbarLayout",
                table: "Organizations");
        }
    }
}
