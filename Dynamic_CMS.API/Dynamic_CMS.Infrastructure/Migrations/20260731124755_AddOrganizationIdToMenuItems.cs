using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dynamic_CMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationIdToMenuItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "SubMenuItems",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "MenuItems",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubMenuItems_OrganizationId",
                table: "SubMenuItems",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_OrganizationId",
                table: "MenuItems",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_MenuItems_Organizations_OrganizationId",
                table: "MenuItems",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SubMenuItems_Organizations_OrganizationId",
                table: "SubMenuItems",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MenuItems_Organizations_OrganizationId",
                table: "MenuItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SubMenuItems_Organizations_OrganizationId",
                table: "SubMenuItems");

            migrationBuilder.DropIndex(
                name: "IX_SubMenuItems_OrganizationId",
                table: "SubMenuItems");

            migrationBuilder.DropIndex(
                name: "IX_MenuItems_OrganizationId",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "SubMenuItems");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "MenuItems");
        }
    }
}
