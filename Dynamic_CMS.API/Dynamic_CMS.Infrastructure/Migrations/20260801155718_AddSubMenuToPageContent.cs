using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dynamic_CMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubMenuToPageContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SubMenuItems_Organizations_OrganizationId",
                table: "SubMenuItems");

            migrationBuilder.DropIndex(
                name: "IX_PageContents_OrganizationId_MenuItemId",
                table: "PageContents");

            migrationBuilder.AlterColumn<Guid>(
                name: "MenuItemId",
                table: "PageContents",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "SubMenuItemId",
                table: "PageContents",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PageContents_OrganizationId_MenuItemId",
                table: "PageContents",
                columns: new[] { "OrganizationId", "MenuItemId" },
                unique: true,
                filter: "[MenuItemId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PageContents_OrganizationId_SubMenuItemId",
                table: "PageContents",
                columns: new[] { "OrganizationId", "SubMenuItemId" },
                unique: true,
                filter: "[SubMenuItemId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PageContents_SubMenuItemId",
                table: "PageContents",
                column: "SubMenuItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_PageContents_SubMenuItems_SubMenuItemId",
                table: "PageContents",
                column: "SubMenuItemId",
                principalTable: "SubMenuItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubMenuItems_Organizations_OrganizationId",
                table: "SubMenuItems",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PageContents_SubMenuItems_SubMenuItemId",
                table: "PageContents");

            migrationBuilder.DropForeignKey(
                name: "FK_SubMenuItems_Organizations_OrganizationId",
                table: "SubMenuItems");

            migrationBuilder.DropIndex(
                name: "IX_PageContents_OrganizationId_MenuItemId",
                table: "PageContents");

            migrationBuilder.DropIndex(
                name: "IX_PageContents_OrganizationId_SubMenuItemId",
                table: "PageContents");

            migrationBuilder.DropIndex(
                name: "IX_PageContents_SubMenuItemId",
                table: "PageContents");

            migrationBuilder.DropColumn(
                name: "SubMenuItemId",
                table: "PageContents");

            migrationBuilder.AlterColumn<Guid>(
                name: "MenuItemId",
                table: "PageContents",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PageContents_OrganizationId_MenuItemId",
                table: "PageContents",
                columns: new[] { "OrganizationId", "MenuItemId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SubMenuItems_Organizations_OrganizationId",
                table: "SubMenuItems",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
