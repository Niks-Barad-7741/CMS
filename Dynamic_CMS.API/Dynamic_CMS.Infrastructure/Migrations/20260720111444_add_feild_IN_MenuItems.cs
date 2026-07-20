using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dynamic_CMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class add_feild_IN_MenuItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "MenuItems",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "MenuItems",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedAt",
                table: "MenuItems",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "MenuItems",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "ModifiedAt",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "MenuItems");
        }
    }
}
