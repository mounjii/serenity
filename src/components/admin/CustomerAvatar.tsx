export default function CustomerAvatar({
  id,
  name,
  updatedAt,
  size = "md",
}: {
  id: string;
  name: string;
  updatedAt: string | null;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "h-14 w-14 text-[1.15rem]" : "h-9 w-9 text-[0.8rem]";
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-forest font-semibold text-white uppercase ${box}`}>
      {updatedAt ? (
        <img src={`/api/admin/customers/${id}/avatar?v=${encodeURIComponent(updatedAt)}`} alt="" className="h-full w-full object-cover" />
      ) : (
        name.slice(0, 1)
      )}
    </span>
  );
}
