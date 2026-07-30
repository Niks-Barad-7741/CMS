using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dynamic_CMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSocialFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SocialGithub",
                table: "Organizations",
                newName: "SocialInstagram");

            migrationBuilder.RenameColumn(
                name: "SocialLinkedin",
                table: "Organizations",
                newName: "SocialFacebook");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SocialInstagram",
                table: "Organizations",
                newName: "SocialGithub");

            migrationBuilder.RenameColumn(
                name: "SocialFacebook",
                table: "Organizations",
                newName: "SocialLinkedin");
        }
    }
}
