import { faker } from "@faker-js/faker";
import { prisma } from "@/utils/prisma/client";
import { subDays } from "date-fns";
import { DocumentActionType, RevisionActionType } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Create organizations
  const organizations = await Promise.all(
    Array.from({ length: 4 }).map(() => {
      return prisma.organization.create({
        data: {
          name: faker.company.name(),
          slug: faker.lorem.slug(),
        },
      });
    })
  );

  // Create users and sign them up with Supabase
  const users = await Promise.all(
    organizations.flatMap((org) =>
      Array.from({ length: 4 }).map(async () => {
        const email = faker.internet.email().toLowerCase();
        const password = "password123";
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        return prisma.profile.create({
          data: {
            id: data!.user!.id,
            email,
            organizationId: org.id,
          },
        });
      })
    )
  );

  // Create documents, revisions, and activities
  await Promise.all(
    organizations.map((org) =>
      Array.from({ length: 20 }).map(async () => {
        const author = faker.helpers.arrayElement(
          users.filter((u) => u.organizationId === org.id)
        );
        const createdAt = subDays(
          new Date(),
          faker.number.int({ min: 1, max: 365 })
        );

        const document = await prisma.document.create({
          data: {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs(
              faker.number.int({ min: 1, max: 4 })
            ),
            organizationId: org.id,
            authorId: author.id,
            createdAt,
          },
        });

        // Create document activities with the same actor as the author for the CREATED action
        const documentActivities = [
          { actionType: "CREATED", actorId: author.id, createdAt },
          {
            actionType: "UPDATED",
            actorId: faker.helpers.arrayElement(users).id,
            createdAt: subDays(
              createdAt,
              -faker.number.int({ min: 1, max: 30 })
            ),
          },
        ];

        await prisma.documentActivity.createMany({
          data: documentActivities.map((activity) => ({
            documentId: document.id,
            actorId: activity.actorId,
            actionType: activity.actionType as DocumentActionType,
            organizationId: org.id,
            createdAt: activity.createdAt,
          })),
        });

        // Create revisions
        const revisions = await Promise.all(
          Array.from({ length: 12 }).map(() => {
            const revisionAuthor = faker.helpers.arrayElement(
              users.filter((u) => u.organizationId === org.id)
            );
            const revisionCreatedAt = subDays(
              createdAt,
              -faker.number.int({ min: 1, max: 30 })
            );

            return prisma.revision.create({
              data: {
                documentId: document.id,
                content: faker.lorem.paragraph(),
                status: "PENDING",
                authorId: revisionAuthor.id,
                createdAt: revisionCreatedAt,
              },
            });
          })
        );

        // Create revision activities
        await Promise.all(
          revisions.map((revision) => {
            const actor = faker.helpers.arrayElement(users);
            const revisionActivities = [
              { actionType: "CREATED", createdAt: revision.createdAt },
              {
                actionType: "ACCEPTED",
                createdAt: subDays(
                  revision.createdAt,
                  -faker.number.int({ min: 1, max: 30 })
                ),
              },
            ];

            return prisma.revisionActivity.createMany({
              data: revisionActivities.map((activity) => ({
                revisionId: revision.id,
                actorId: actor.id,
                actionType: activity.actionType as RevisionActionType,
                createdAt: activity.createdAt,
              })),
            });
          })
        );
      })
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
