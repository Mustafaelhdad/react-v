import { trpc } from "@/trpc";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ExperienceForm } from "@/features/experiences/components/ExperienceForm";
import Card from "@/features/shared/components/ui/Card";
import { Experience } from "@advanced-react/server/database/schema";
import { router } from "@/router";

export const Route = createFileRoute("/experiences/$experienceId/edit")({
  params: {
    parse: (params) => ({
      experienceId: z.coerce.number().parse(params.experienceId),
    }),
  },
  component: ExperienceEditPage,
});

function ExperienceEditPage() {
  const { experienceId } = Route.useParams();

  const [experience] = trpc.experiences.byId.useSuspenseQuery({
    id: experienceId,
  });

  function navigateToExperience(id: Experience["id"]) {
    router.navigate({
      to: "/experiences/$experienceId",
      params: { experienceId: id },
    });
  }

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Experience</h1>

      <Card>
        <ExperienceForm
          experience={experience}
          onSuccess={navigateToExperience}
          onCancel={navigateToExperience}
        />
      </Card>
    </main>
  );
}
