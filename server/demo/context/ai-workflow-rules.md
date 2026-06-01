# AI Workflow Rules

## Purpose

Follow these rules when building the Fishing Store Workshop App. Treat this file as direct instructions. Do not treat these rules as optional guidelines.

## Required Approach

- Build this project with a spec-driven, incremental workflow.
- Read the context files before implementing:
  - `server/demo/context/project-overview.md`
  - `server/demo/context/architecture.md`
  - `server/demo/context/code-standards.md`
  - `server/demo/context/progress-tracker.md`
- Read the relevant source files before changing code.
- Identify the smallest useful unit of work before editing files.
- Implement one unit at a time.
- Verify the unit before starting another unit.
- Update the relevant documentation after meaningful implementation work.
- Do not invent product behavior that is not supported by the context files, source code, or explicit user instruction.

## Working Order

1. Read the current project context files.
2. Read the files directly related to the requested unit.
3. Restate the unit of work in concrete terms before implementation.
4. Identify the layer or boundary affected by the unit.
5. Implement only the requested unit.
6. Run the smallest relevant verification command.
7. Fix issues introduced by the unit.
8. Update `progress-tracker.md` after meaningful implementation work.
9. Update other context docs when architecture, scope, standards, or domain rules change.
10. Stop and report what changed, what was verified, and what remains.

## Scoping Rules

- Work on one feature unit, bug fix, documentation update, or refactor at a time.
- Keep each unit small enough to review and verify.
- Do not combine unrelated backend, frontend, database, and documentation changes unless one unit explicitly requires them.
- Do not make speculative changes.
- Do not perform broad refactors unless the user explicitly asks for them or the unit cannot be completed safely without them.
- Do not rewrite working code only to match personal style.
- Do not change behavior outside the requested unit.
- Preserve the Three-Layer Architecture:
  - Keep HTTP and request/response handling in controllers.
  - Keep business rules in services.
  - Keep persistence access in repositories.
  - Keep persistence state in entities.
  - Keep API/service boundaries in DTOs.
- Do not expose JPA entities directly to frontend or API callers.
- Do not bypass the service layer from controllers or UI integration code.

## When to Split Work

Split the work before implementation if the requested unit:

- Changes more than one feature domain, such as Repair Orders and Installments, without a shared reason.
- Changes database schema, backend logic, and frontend UI in one step.
- Adds or changes authentication, authorization, JWT handling, or password behavior.
- Changes financial calculations, payment handling, soft delete behavior, or historical records.
- Requires changes to generated UI components or shared library components.
- Requires a migration or schema change that affects existing data.
- Cannot be verified quickly with focused tests, builds, or manual checks.
- Contains unclear product behavior or missing acceptance criteria.
- Touches files that are protected by these workflow rules.

When splitting work, define the first smallest safe unit and complete only that unit.

## Handling Missing or Ambiguous Requirements

- Search the context files and relevant source code before asking for clarification.
- Use existing project rules from `project-overview.md`, `architecture.md`, and `code-standards.md` when they answer the question.
- Stop and ask the user when a missing requirement changes product behavior, data shape, security, financial logic, or user-visible workflow.
- Record unresolved requirements in `progress-tracker.md` as open questions when implementation cannot continue safely.
- Do not choose business behavior for payments, soft delete, auth, roles, financial totals, WhatsApp delivery, or history retention without explicit support.
- Do not silently choose a database schema change when a DTO/service-only change could satisfy the unit.
- Do not treat frontend static data as the source of truth once backend integration exists.

## Protected Files

Do not modify these files or paths without explicit instruction or a clearly required implementation reason:

- `frontend/src/components/ui/*`
- `frontend/components.json`
- `frontend/package-lock.json`
- `server/demo/mvnw`
- `server/demo/mvnw.cmd`
- `.gitignore`
- Environment files or local secret files.
- Generated build output such as `frontend/dist`, `server/demo/target`, cache folders, and coverage folders.
- Third-party, vendor, or generated library internals.

Do not modify SQL schema files unless the requested unit explicitly includes a database model change:

- `server/demo/sql/workshop-prod.sql`
- `server/demo/sql/workshop-test.sql`

If a protected file must change, state why it must change before editing it.

## Documentation Sync Rules

- Update `server/demo/context/project-overview.md` when product scope, goals, user flows, features, or success criteria change.
- Update `server/demo/context/architecture.md` when system boundaries, storage model, auth model, API boundaries, domain model, or invariants change.
- Update `server/demo/context/code-standards.md` when conventions, layer rules, validation rules, testing rules, or database standards change.
- Update `server/demo/context/progress-tracker.md` after meaningful implementation work.
- Add open questions to `progress-tracker.md` when requirements remain unresolved.
- Keep docs consistent with code. Do not let implementation and context files describe different behavior.
- Do not update documentation just to create noise. Update docs when the implemented behavior, architecture, or current progress changes.

## Backend Rules to Preserve

- Use Java 17, Spring Boot 4, Spring Data JPA, and MySQL 8 standards from `code-standards.md`.
- Keep business rules in the service layer.
- Keep repositories focused on persistence access.
- Keep DTOs as the service/API boundary.
- Keep JPA entities hidden from frontend/API callers.
- Use `BigDecimal` for money.
- Preserve soft delete as the required user-facing delete behavior for Repair Orders and Installments.
- Treat payment records as append-only history unless a correction workflow is explicitly specified.
- Keep parent financial summary fields synchronized with payment records.
- Protect referential integrity for Clients, Services, Users, Roles, Repair Orders, Installments, and Payments.
- Preserve historical Repair Order item pricing.

## Verification Checklist

Before moving to the next unit, verify all of the following:

1. The completed work matches the requested unit.
2. No unrelated behavior changed.
3. No protected file changed unexpectedly.
4. No architecture invariant from `architecture.md` was violated.
5. No code standard from `code-standards.md` was violated.
6. Service-layer business rules remain in services.
7. Repository code remains persistence-only.
8. DTO boundaries remain intact.
9. Financial, payment, soft delete, and history behavior remain consistent.
10. Relevant backend tests were run when backend code changed.
11. Relevant frontend build or lint checks were run when frontend code changed.
12. Documentation was updated when scope, architecture, standards, or progress changed.
13. `progress-tracker.md` reflects completed work, in-progress work, next steps, and open questions.

## Completion Report Rules

- Report the files changed.
- Report the verification commands run and their results.
- Report any verification that could not be run.
- Report any assumptions used.
- Report any remaining open questions or follow-up units.
