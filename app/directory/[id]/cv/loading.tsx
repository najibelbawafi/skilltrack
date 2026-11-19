export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0756A5]" />
        <p className="mt-4 text-sm text-gray-500">
          Memuat CV siswa...
        </p>
      </div>
    </main>
  );
}
