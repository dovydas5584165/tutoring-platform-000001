import { notFound } from "next/navigation";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) return notFound();

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Tvarkaraštis pamokai: <span className="capitalize">{slug}</span>
      </h1>
      <p className="text-gray-600">
        Čia bus rodomi mokytojai ir jų prieinamumo laikai, filtruoti pagal pamoką
        „{slug}“.
      </p>
    </div>
  );
}
