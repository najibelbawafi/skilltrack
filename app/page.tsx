
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  FolderKanban,
  Lightbulb,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";
import { motion } from "motion/react";

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
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: Award,
    title: "Certificates & Achievements",
    description:
      "Simpan sertifikat, prestasi, dan pencapaian yang pernah kamu raih.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: Lightbulb,
    title: "Skills & Experiences",
    description:
      "Tampilkan kemampuan dan pengalaman yang telah kamu kembangkan.",
    color: "bg-sky-50 text-sky-700",
  },
];

const steps = [
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
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-800">
      {/* NAVIGATION */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/skilltrack-icon.svg"
              alt="SkillTrack"
              width={38}
              height={38}
              priority
              className="rounded-xl"
            />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Skill<span className="text-[#0756A5]">Track</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <a href="#home" className="hover:text-[#0756A5]">
              Home
            </a>
            <a href="#about" className="hover:text-[#0756A5]">
              About
            </a>
            <a href="#features" className="hover:text-[#0756A5]">
              Features
            </a>
            <Link href="/directory" className="hover:text-[#0756A5]">
              Student Directory
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#0756A5] sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0756A5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 hover:bg-[#064783] sm:px-5"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* HERO */}
      <section
        id="home"
        className="relative isolate scroll-mt-20 overflow-hidden bg-[#F7F9FC]"
      >
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-sky-100/70 blur-[100px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-10 lg:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-blue-100 bg-white px-4 py-2.5 text-xs font-semibold text-[#0756A5] shadow-sm sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Student Portfolio & Directory Platform
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="max-w-2xl text-[40px] font-bold leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-[62px]"
            >
              Show Your Skills.
              <span className="mt-1 block text-[#0756A5]">
                Share Your Journey.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-6 max-w-xl text-sm leading-8 text-slate-600 sm:text-base"
            >
              Bangun portofolio digital, dokumentasikan setiap karya, dan
              tampilkan perjalanan pendidikan serta kemampuanmu dalam satu
              platform.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-900/10 hover:-translate-y-0.5 hover:bg-[#064783] sm:px-6"
              >
                Buat Portofolio
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/directory"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#0756A5] sm:px-6"
              >
                Jelajahi Siswa
                <ArrowUpRight size={18} />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500 sm:text-sm"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-600" />
                Personal Portfolio
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-600" />
                Student Directory
              </span>
            </motion.div>
          </motion.div>

          {/* PORTFOLIO PREVIEW */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-blue-200/40 blur-3xl" />

            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/[0.06] sm:rounded-3xl sm:p-7"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[2px] text-slate-400">
                    STUDENT PORTFOLIO
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    My Profile
                  </h3>
                </div>

                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Published
                </span>
              </div>

              <div className="flex items-center gap-4 py-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                  <UserRound size={32} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900">
                    Student Name
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Student · Technology Enthusiast
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#0756A5]">
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
                  <motion.div
                    key={item.label}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center sm:p-4"
                  >
                    <p className="text-2xl font-bold text-[#0756A5]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    Featured Projects
                  </h4>
                  <span className="text-xs font-semibold text-[#0756A5]">
                    View All
                  </span>
                </div>

                <div className="space-y-3">
                  <motion.div
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-blue-100"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                      <Code2 size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        Smart IoT Project
                      </p>
                      <p className="text-xs text-slate-500">
                        Electronics · IoT
                      </p>
                    </div>
                    <ArrowUpRight
                      className="ml-auto shrink-0 text-slate-400"
                      size={17}
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-blue-100"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <FolderKanban size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        Web Development
                      </p>
                      <p className="text-xs text-slate-500">
                        Website · Programming
                      </p>
                    </div>
                    <ArrowUpRight
                      className="ml-auto shrink-0 text-slate-400"
                      size={17}
                    />
                  </motion.div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs font-medium text-[#0756A5]">
                <ShieldCheck size={17} />
                One platform for your entire journey.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.45 }}
              className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-900/5 sm:flex"
            >
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                <Award size={21} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Your achievements
                </p>
                <p className="text-xs text-slate-500">All in one place</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold uppercase tracking-[2px] text-[#0756A5]"
          >
            About SkillTrack
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Every Skill Has a Story.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-sm leading-8 text-slate-600 sm:text-base"
          >
            SkillTrack adalah platform digital yang membantu siswa
            mendokumentasikan kemampuan, karya, pencapaian, dan pengalaman
            mereka menjadi portofolio yang terstruktur dan mudah diakses.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="mt-14 grid gap-6 md:grid-cols-2"
        >
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-lg hover:shadow-slate-900/[0.04] sm:p-8"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
              <UserRound size={25} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Student Portfolio
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Tempat siswa membangun dan mengelola portofolio digital melalui
              data diri, pendidikan, keahlian, proyek, sertifikat, prestasi,
              dan pengalaman.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3"
            >
              Mulai membuat portofolio
              <ArrowRight size={17} />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-lg hover:shadow-slate-900/[0.04] sm:p-8"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users size={25} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Student Directory
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Tempat pengunjung melihat daftar siswa, mengenal profil mereka,
              serta menjelajahi riwayat dan portofolio digital yang
              dipublikasikan.
            </p>
            <Link
              href="/directory"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3"
            >
              Jelajahi direktori
              <ArrowRight size={17} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="relative scroll-mt-24 overflow-hidden bg-[#F6F9FD] py-20 lg:py-24"
      >
        <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-blue-100/70 blur-[90px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-bold uppercase tracking-[2px] text-[#0756A5]"
            >
              What You Can Manage
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Everything That Defines Your Journey.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-sm leading-7 text-slate-600 sm:text-base"
            >
              Kelola berbagai informasi dan pencapaian dalam satu portofolio
              digital yang terorganisir.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.02] transition-shadow hover:shadow-lg hover:shadow-slate-900/[0.04]"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold uppercase tracking-[2px] text-[#0756A5]"
          >
            How It Works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl"
          >
            Start Your Journey in Three Steps.
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-slate-200 bg-white p-7 text-center transition-shadow hover:shadow-lg hover:shadow-slate-900/[0.04]"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                  <Icon size={29} />
                </div>
                <p className="mt-5 text-xs font-bold tracking-wider text-emerald-600">
                  STEP {step.number}
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-500">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CALL TO ACTION */}
      <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#0756A5] to-[#0B4380] px-7 py-14 text-center text-white shadow-xl shadow-blue-900/10 sm:px-12"
        >
          <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full border border-white/10 bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full border border-white/10 bg-white/5 blur-2xl" />

          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Your Journey Deserves to Be Seen.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
              Mulai dokumentasikan kemampuan, karya, dan pencapaianmu bersama
              SkillTrack.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#0756A5] hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Create Your Portfolio
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-9 sm:flex-row sm:items-center sm:px-8 lg:px-10">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight">
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
          © 2026 SkillTrack. Student Portfolio Platform.
        </div>
      </footer>
    </main>
  );
}
