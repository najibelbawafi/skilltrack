
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";

const features = [
  {
    icon: UserRound,
    title: "Personal Information",
    description:
      "Kelola informasi diri, profil, dan identitas pendidikan dalam satu tempat.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: FolderKanban,
    title: "Project Showcase",
    description:
      "Dokumentasikan proyek, karya, teknologi, dan hasil pekerjaanmu.",
    color: "bg-green-50 text-green-700",
  },
  {
    icon: Award,
    title: "Certificates & Achievements",
    description:
      "Simpan sertifikat, prestasi, dan pencapaian yang pernah kamu raih.",
    color: "bg-red-50 text-red-700",
  },
  {
    icon: Lightbulb,
    title: "Skills & Experiences",
    description:
      "Tampilkan kemampuan dan pengalaman yang telah kamu kembangkan.",
    color: "bg-blue-50 text-blue-700",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#25364A]">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0756A5] text-white">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Skill<span className="text-[#0756A5]">Track</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#home" className="transition hover:text-[#0756A5]">
              Home
            </a>
            <a href="#about" className="transition hover:text-[#0756A5]">
              About
            </a>
            <a href="#features" className="transition hover:text-[#0756A5]">
              Features
            </a>
            <Link href="/directory" className="transition hover:text-[#0756A5]">
              Student Directory
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50 sm:block"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#0756A5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden bg-[#F4F7FB]">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-[#0756A5] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#159447]" />
              Student Portfolio & Directory Platform
            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[#25364A] sm:text-5xl lg:text-6xl">
              Show Your Skills.
              <span className="block text-[#0756A5]">
                Share Your Journey.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Bangun portofolio digital, dokumentasikan setiap karya, dan
              tampilkan perjalanan pendidikan serta kemampuanmu dalam satu
              platform.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0756A5] px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                Buat Portofolio
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/directory"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-[#25364A] transition hover:border-[#0756A5] hover:text-[#0756A5]"
              >
                Jelajahi Siswa
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#159447]" />
                Personal Portfolio
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#159447]" />
                Student Directory
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-3xl bg-blue-100/70 blur-2xl" />

            <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-blue-900/10 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    STUDENT PORTFOLIO
                  </p>
                  <h3 className="mt-1 text-lg font-bold">My Profile</h3>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  Published
                </span>
              </div>

              <div className="flex items-center gap-4 py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-[#0756A5]">
                  <UserRound size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Student Name</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Student · Technology Enthusiast
                  </p>
                  <p className="mt-1 text-xs text-[#0756A5]">
                    Digital Portfolio
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "08", label: "Skills" },
                  { value: "05", label: "Projects" },
                  { value: "04", label: "Awards" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-[#F4F7FB] p-4 text-center"
                  >
                    <p className="text-2xl font-bold text-[#0756A5]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold">Featured Projects</h4>
                  <span className="text-xs font-medium text-[#0756A5]">
                    View All
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#0756A5]">
                      <Code2 size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Smart IoT Project</p>
                      <p className="text-xs text-slate-500">
                        Electronics · IoT
                      </p>
                    </div>
                    <ArrowUpRight className="ml-auto text-slate-400" size={17} />
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-700">
                      <FolderKanban size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Web Development</p>
                      <p className="text-xs text-slate-500">
                        Website · Programming
                      </p>
                    </div>
                    <ArrowUpRight className="ml-auto text-slate-400" size={17} />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs font-medium text-[#0756A5]">
                <ShieldCheck size={17} />
                One platform for your entire journey.
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-lg sm:flex">
              <div className="rounded-lg bg-green-50 p-2 text-green-700">
                <Award size={21} />
              </div>
              <div>
                <p className="text-sm font-bold">Your achievements</p>
                <p className="text-xs text-slate-500">All in one place</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#0756A5]">
            About SkillTrack
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Every Skill Has a Story.
          </h2>
          <p className="mt-5 leading-8 text-slate-600">
            SkillTrack adalah platform digital yang membantu siswa
            mendokumentasikan kemampuan, karya, pencapaian, dan pengalaman
            mereka menjadi portofolio yang terstruktur dan mudah diakses.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
              <UserRound size={25} />
            </div>
            <h3 className="text-xl font-bold">Student Portfolio</h3>
            <p className="mt-3 leading-7 text-slate-600">
              Tempat siswa membangun dan mengelola portofolio digital melalui
              data diri, pendidikan, keahlian, proyek, sertifikat, prestasi,
              dan pengalaman.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3"
            >
              Mulai membuat portofolio <ArrowRight size={17} />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <Users size={25} />
            </div>
            <h3 className="text-xl font-bold">Student Directory</h3>
            <p className="mt-3 leading-7 text-slate-600">
              Tempat pengunjung melihat daftar siswa, mengenal profil mereka,
              serta menjelajahi riwayat dan portofolio digital yang
              dipublikasikan.
            </p>
            <Link
              href="/directory"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3"
            >
              Jelajahi direktori <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#F4F7FB] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-[#0756A5]">
              What You Can Manage
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything That Defines Your Journey.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Kelola berbagai informasi dan pencapaian dalam satu portofolio
              digital yang terorganisir.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#0756A5]">
            How It Works
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Start Your Journey in Three Steps.
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {[
            {
              number: "01",
              icon: Users,
              title: "Create Your Account",
              description:
                "Daftar dan buat akun untuk mulai mengelola informasi pribadi.",
            },
            {
              number: "02",
              icon: BookOpen,
              title: "Build Your Portfolio",
              description:
                "Masukkan pendidikan, keahlian, proyek, sertifikat, dan pengalaman.",
            },
            {
              number: "03",
              icon: BriefcaseBusiness,
              title: "Share Your Journey",
              description:
                "Publikasikan portofolio agar dapat dilihat melalui Student Directory.",
            },
          ].map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                  <Icon size={29} />
                </div>
                <p className="mt-5 text-sm font-bold text-[#159447]">
                  STEP {step.number}
                </p>
                <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#0756A5] px-7 py-14 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Your Journey Deserves to Be Seen.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-blue-100">
            Mulai dokumentasikan kemampuan, karya, dan pencapaianmu bersama
            SkillTrack.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-[#0756A5] transition hover:bg-blue-50"
          >
            Create Your Portfolio <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-9 sm:flex-row sm:items-center lg:px-10">
          <div>
            <Link href="/" className="text-xl font-bold">
              Skill<span className="text-[#0756A5]">Track</span>
            </Link>
            <p className="mt-2 text-sm text-slate-500">
              Student Portfolio & Directory Platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-[#0756A5]">
              Home
            </Link>
            <Link href="/directory" className="hover:text-[#0756A5]">
              Student Directory
            </Link>
            <Link href="/login" className="hover:text-[#0756A5]">
              Login
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
          © 2026 SkillTrack/Najieb
        </div>
      </footer>
    </main>
  );
}
