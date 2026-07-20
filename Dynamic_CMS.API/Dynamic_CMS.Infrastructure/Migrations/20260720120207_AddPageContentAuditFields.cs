using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dynamic_CMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPageContentAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreateDate",
                table: "PageContents",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "PageContents",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "PageContents",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedDate",
                table: "PageContents",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreateDate",
                table: "PageContents");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PageContents");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "PageContents");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "PageContents");
        }
    }
}
