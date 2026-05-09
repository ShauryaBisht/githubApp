import { Probot } from "probot";

interface Trial {
  pull_requests?: {
    thresholds?: {
      medium?: number;
      large?: number;
    };
  };
}

export default (app: Probot) => {
  app.on("issues.opened", async (context) => {
    const config = await context.config("config.yml", {
      issues: { min_body_length: 50, needs_info_label: "needs-more-info" },
    });

    const issueBody = context.payload.issue.body || "";

    if (issueBody.length < (config?.issues?.min_body_length || 50)) {
      await context.octokit.rest.issues.addLabels(
        context.issue({
          labels: [config?.issues?.needs_info_label || "needs-more-info"],
        }),
      );
      await context.octokit.rest.issues.createComment(
        context.issue({
          body: "Please provide more details (minimum 50 characters).",
        }),
      );
    } else {
      await context.octokit.rest.issues.createComment(
        context.issue({ body: "Thanks for opening this issue!" }),
      );
    }
  });

  app.on("issue_comment.created", async (context) => {
    const config = await context.config("config.yml", {
      assignment: { min_role: "CONTRIBUTOR" },
    });

    const commentbody = context.payload.comment.body.trim();

    if (commentbody.startsWith("/assign")) {
      const userRole = context.payload.comment.author_association;
      const username = context.payload.comment.user?.login;

      const roles = ["OWNER", "MEMBER", "COLLABORATOR", "CONTRIBUTOR", "NONE"];
      const minRole = config?.assignment?.min_role || "CONTRIBUTOR";

      const isAuthorized = roles.indexOf(userRole) <= roles.indexOf(minRole);

      if (username && isAuthorized) {
        await context.octokit.rest.issues.addAssignees({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          issue_number: context.payload.issue.number,
          assignees: [username],
        });
      } else if (username) {
        await context.octokit.rest.issues.createComment(
          context.issue({
            body: `Sorry @${username}, this issue is reserved for established contributors.`,
          }),
        );
      }
    }
  });

  app.on("pull_request.opened", async (context) => {
    const addition = context.payload.pull_request.additions;
    const deletion = context.payload.pull_request.deletions;
    const total = addition + deletion;
    const config = await context.config<Trial>("config.yml");

    const medium = config?.pull_requests?.thresholds?.medium || 100;
    const large = config?.pull_requests?.thresholds?.large || 500;

    let label = "size/S";
    if (total >= large) {
      label = "size/L";
    } else if (total >= medium) label = "size/M";

    await context.octokit.rest.issues.addLabels(
      context.issue({
        issue_number: context.payload.pull_request.number,
        labels: [label],
      }),
    );
  });
};
