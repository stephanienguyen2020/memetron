"use client";

import { motion } from "framer-motion";
import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/Footer";
import GridBackground from "../components/GridBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Twitter, Github, Linkedin, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const founders = [
  {
    name: "Stephanie Ng.",
    role: "CEO & Co-Founder",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/founder1-9CtIVDwF31CgvHZCL8GwzySvDqZBkk.webp",
    bio: "Former Binance executive with 10+ years in crypto. Led multiple successful DeFi projects.",
    twitter: "https://twitter.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Gokul",
    role: "CTO & Co-Founder",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/founder2-4K3e6I5QhgBXpTWEhvI7I5qXXtfIUE.webp",
    bio: "AI researcher and blockchain developer. Previously built trading algorithms at Jump Trading.",
    twitter: "https://twitter.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Dylan Ng.",
    role: "Head of Product & Co-Founder",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/founder3-DlPFrwUESPJjYSvtnOmuykB3LtDt0V.jpeg",
    bio: "Product leader with experience at Coinbase and FTX. Passionate about UX and accessibility.",
    twitter: "https://twitter.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Daniel Dong",
    role: "Head of Research & Co-Founder",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/founder4-mKXeebWUsUBtmoISgvglG97u44D3uK.png",
    bio: "PhD in Machine Learning. Led research teams at DeepMind focusing on market prediction.",
    twitter: "https://twitter.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
];

const stats = [
  { label: "Trading Volume", value: "$420M+" },
  { label: "Active Users", value: "50,000+" },
  { label: "Predictions Made", value: "1.2M+" },
  { label: "Success Rate", value: "76%" },
];

const values = [
  {
    title: "Innovation First",
    description:
      "Pushing the boundaries of what's possible with AI and blockchain technology.",
  },
  {
    title: "Community Driven",
    description:
      "Building and growing together with our passionate community of traders and developers.",
  },
  {
    title: "Transparency",
    description:
      "Operating with complete openness and accountability in everything we do.",
  },
  {
    title: "Security",
    description:
      "Maintaining the highest standards of security to protect our users and their assets.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <GridBackground />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <Badge
              variant="outline"
              className="w-fit mx-auto bg-sky-500/10 text-sky-500 border-sky-500/20"
            >
              About HedgeFi
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">
              Revolutionizing{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                Meme Coin Trading
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              HedgeFi was founded in 2025 with a simple mission: to bring
              institutional-grade AI technology to meme coin traders. We believe
              that everyone deserves access to sophisticated trading tools,
              regardless of their experience level.
            </p>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-white/10 bg-black/60 backdrop-blur-xl"
              >
                <CardContent className="p-6">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </section>

        {/* Founders Section */}
        <section className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our founders bring together decades of experience in
                cryptocurrency, artificial intelligence, and decentralized
                finance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {founders.map((founder, index) => (
                <motion.div
                  key={founder.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={founder.image || "/placeholder.svg"}
                        alt={founder.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg">{founder.name}</h3>
                        <p className="text-sm text-sky-400">{founder.role}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {founder.bio}
                      </p>
                      <div className="flex gap-4">
                        <Link href={founder.twitter} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Twitter className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={founder.github} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Github className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={founder.linkedin} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Values Section */}
        <section className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide us in building the future of
                decentralized finance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-center space-y-6"
          >
            <h2 className="text-3xl font-bold">Join Us on Our Mission</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're always looking for talented individuals who share our vision
              for the future of decentralized finance.
            </p>
            <Button className="gap-2">
              View Open Positions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
