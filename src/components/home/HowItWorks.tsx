import { motion } from "framer-motion";
import searchImg from "@/assets/how-it-works-search.png";
import connectImg from "@/assets/how-it-works-connect.png";
import yoursImg from "@/assets/how-it-works-yours.png";

const steps = [
  {
    number: "01",
    title: "Find Your Match",
    description:
      "Use our smart search to find your next property with the perfect location, amenities, and more.",
    image: searchImg,
  },
  {
    number: "02",
    title: "Connect Directly",
    description:
      "Message buyers or sellers instantly through our platform with no middlemen – direct communication.",
    image: connectImg,
  },
  {
    number: "03",
    title: "Make It Yours",
    description:
      "Negotiate freely and close the deal on your terms. Move into your new place. Make it home.",
    image: yoursImg,
  },
];

export function HowItWorks({ className }: { className?: string }) {
  return (
    <section
      className={`py-24 sm:py-32 ${className || ""}`}
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--muted) / 0.5), hsl(var(--muted) / 0.8))",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-foreground/10 text-foreground/70 text-sm font-medium mb-4 border border-foreground/10">
            Step 02
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-5 max-w-xl mx-auto text-lg leading-relaxed">
            Finding or selling a property has never been easier. Follow these
            simple steps.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{
                y: -12,
                scale: 1.03,
                transition: { duration: 0.35, ease: "easeOut" },
              }}
              className="group relative flex flex-col rounded-3xl overflow-hidden border border-white/20 cursor-default transition-all duration-500 before:absolute before:inset-0 before:z-20 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] before:skew-x-[-20deg] before:transition-transform before:duration-700 before:ease-in-out hover:before:translate-x-[200%] before:pointer-events-none"
              style={{
                background:
                  "linear-gradient(160deg, hsl(190 30% 65% / 0.45), hsl(200 35% 55% / 0.35))",
                backdropFilter: "blur(20px) saturate(180%)",
                boxShadow:
                  "0 20px 50px -12px hsl(200 30% 30% / 0.2), inset 0 0 0 1px rgba(255,255,255,0.15)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 30px 60px -15px hsl(var(--accent) / 0.35), inset 0 0 0 1px rgba(255,255,255,0.3), 0 0 20px hsl(var(--accent) / 0.15)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 20px 50px -12px hsl(200 30% 30% / 0.2), inset 0 0 0 1px rgba(255,255,255,0.15)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
            >
              {/* Step number + illustration area */}
              <div className="relative h-52 sm:h-56 flex items-center justify-center overflow-hidden">
                {/* Large step number */}
                <span className="absolute top-4 left-5 text-6xl sm:text-7xl font-black text-foreground/15 leading-none select-none z-0">
                  {step.number}
                </span>

                {/* Illustration */}
                <motion.img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-xl transition-[filter] duration-500 group-hover:drop-shadow-[0_10px_25px_hsl(var(--accent)/0.4)]"
                  initial={{ y: 0, rotate: 0 }}
                  whileHover={{ scale: 1.12, rotate: 3, y: -6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                />
              </div>

              {/* Text content */}
              <div className="px-6 pb-6 pt-2 text-center">
                <h3 className="font-display text-xl font-bold text-foreground mb-2 transition-colors duration-300 group-hover:text-accent">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed transition-colors duration-300 group-hover:text-foreground/80">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
