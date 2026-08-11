"use client";

import { useState, useRef } from "react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  text: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Neha Sharma",
    role: "MBA Trainee",
    company: "Apex Corp",
    text: "The practical training and mock interview sessions at SBS Prospects completely transformed my confidence. I went from feeling unprepared to securing my dream role.",
    initials: "NS",
  },
  {
    id: 2,
    name: "Rohan Patel",
    role: "Hiring Partner / HR Lead",
    company: "Zeta Solutions",
    text: "We've hired multiple candidates from SBS Prospects' training cohorts. Their hands-on experience and day-one readiness are exceptional.",
    initials: "RP",
  },
  {
    id: 3,
    name: "Dev Malhotra",
    role: "Marketing Trainee",
    company: "SBS Alumni",
    text: "Working on active corporate projects during the course allowed me to build a practical portfolio that immediately stood out to recruiters.",
    initials: "DM",
  },
  {
    id: 4,
    name: "Priya Nair",
    role: "HR Consultant / Partner",
    company: "Scale HR",
    text: "Their alignment of skills training with corporate recruitment standards makes SBS Prospects the gold standard for job readiness.",
    initials: "PN",
  },
  {
    id: 5,
    name: "Arjun Singh",
    role: "Operations Graduate",
    company: "Corporate Placed",
    text: "The mock interviews and resume guidance gave me a clear direction. The mentorship was outstanding, pushing me to achieve my potential.",
    initials: "AS",
  },
];

const doubled = [...testimonials, ...testimonials, ...testimonials];

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#e9c349" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

const TestimonialCard = ({ item }: { item: Testimonial }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: "320px",
        maxWidth: "320px",
        background: hovered
          ? "rgba(255, 248, 239, 0.92)"
          : "rgba(255, 248, 239, 0.78)",
        border: hovered
          ? "1px solid rgba(233, 195, 73, 0.5)"
          : "1px solid rgba(233, 195, 73, 0.2)",
        borderRadius: "16px",
        padding: "32px 26px 26px",
        marginTop: "26px",
        position: "relative",
        cursor: "default",
        transform: hovered ? "translateY(-7px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 24px 48px rgba(0, 6, 19, 0.12), 0 0 0 1px rgba(233,195,73,0.15)"
          : "0 4px 24px rgba(0, 6, 19, 0.06)",
        transition: "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        flexShrink: 0,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          position: "absolute",
          top: "-22px",
          left: "26px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #e9c349 0%, #fed65b 100%)",
          border: "2px solid #fff8ef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: "600",
          color: "#000613",
          letterSpacing: "0.04em",
          fontFamily: "var(--font-playfair), Georgia, serif",
          boxShadow: "0 4px 16px rgba(233,195,73,0.35), 0 2px 8px rgba(0,6,19,0.12)",
        }}
      >
        {item.initials}
      </div>

      {/* Stars */}
      <div style={{ display: "flex", gap: "2px", marginBottom: "14px", paddingTop: "6px" }}>
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>

      {/* Quote */}
      <p
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: "14px",
          lineHeight: "1.72",
          color: "#1e1b13",
          fontStyle: "italic",
          marginBottom: "20px",
          fontWeight: "400",
          letterSpacing: "0.01em",
        }}
      >
        &ldquo;{item.text}&rdquo;
      </p>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(233,195,73,0.4), transparent)",
          marginBottom: "14px",
        }}
      />

      {/* Client info */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "13px",
            fontWeight: "600",
            color: "#000613",
            letterSpacing: "0.03em",
            marginBottom: "2px",
          }}
        >
          {item.name}
        </p>
        <p
          style={{
            fontSize: "10px",
            color: "#43474e",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: "2px",
          }}
        >
          {item.role}
        </p>
        <p
          style={{
            fontSize: "10px",
            color: "#735c00",
            letterSpacing: "0.06em",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {item.company}
        </p>
      </div>
    </div>
  );
};

export default function SBSTestimonials() {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <style>{`
        @keyframes sbs-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }

        .sbs-marquee-track {
          animation: sbs-marquee 40s linear infinite;
        }
        .sbs-marquee-track.paused {
          animation-play-state: paused;
        }

        .sbs-testimonials-section::before {
          content: '';
          position: absolute;
          top: 5%;
          left: 10%;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(233,195,73,0.07) 0%, transparent 65%);
          pointer-events: none;
          border-radius: 50%;
        }
        .sbs-testimonials-section::after {
          content: '';
          position: absolute;
          bottom: 5%;
          right: 8%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(233,195,73,0.05) 0%, transparent 65%);
          pointer-events: none;
          border-radius: 50%;
        }

        .sbs-fade-left {
          background: linear-gradient(90deg, #fbf3e4 0%, transparent 100%);
        }
        .sbs-fade-right {
          background: linear-gradient(270deg, #fbf3e4 0%, transparent 100%);
        }
      `}</style>

      <section
        className="sbs-testimonials-section"
        style={{
          width: "100%",
          background: "#fbf3e4",
          padding: "90px 0 100px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {/* Subtle surface texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(233,195,73,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            textAlign: "center",
            padding: "0 24px",
            marginBottom: "56px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Label */}
          <p
            style={{
              fontSize: "10px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#e9c349",
              marginBottom: "20px",
              fontWeight: "500",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            What Our Clients Say
          </p>

          {/* Decorative line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "28px",
            }}
          >
            <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(233,195,73,0.6))" }} />
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#e9c349", opacity: 0.7 }} />
            <div style={{ width: "40px", height: "1px", background: "linear-gradient(270deg, transparent, rgba(233,195,73,0.6))" }} />
          </div>

          {/* Main heading */}
          <h2
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "30px",
              fontWeight: "400",
              color: "#000613",
              lineHeight: "1.24",
              letterSpacing: "-0.01em",
              maxWidth: "720px",
              margin: "0 auto 22px",
            }}
          >
            Trusted Relationships Built Through{" "}
            <em style={{ fontStyle: "italic", color: "#735c00" }}>Consistency,</em>
            <br />
            Practice &amp; Skill Excellence
          </h2>

          {/* Subtext */}
          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.75",
              color: "#43474e",
              maxWidth: "480px",
              margin: "0 auto",
              letterSpacing: "0.01em",
              fontWeight: "400",
            }}
          >
            Every career path is unique. Our trainees and corporate partners trust us for
            practical guidance, hands-on learning, and active job placements.
          </p>
        </div>

        {/* Marquee Container */}
        <div
          style={{ position: "relative", zIndex: 2 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Fade edges */}
          <div
            className="sbs-fade-left"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "100px",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />
          <div
            className="sbs-fade-right"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "100px",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Track */}
          <div style={{ overflow: "hidden" }}>
            <div
              ref={trackRef}
              className={`sbs-marquee-track${paused ? " paused" : ""}`}
              style={{
                display: "flex",
                gap: "20px",
                padding: "8px 0 36px",
                width: "max-content",
                paddingLeft: "20px",
              }}
            >
              {doubled.map((item, idx) => (
                <TestimonialCard key={`${item.id}-${idx}`} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom brand line */}
        <div
          style={{
            textAlign: "center",
            marginTop: "44px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <div style={{ width: "28px", height: "1px", background: "rgba(233,195,73,0.4)" }} />
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(115, 92, 0, 0.5)",
                fontWeight: "400",
              }}
            >
              SBS Prospects
            </p>
            <div style={{ width: "28px", height: "1px", background: "rgba(233,195,73,0.4)" }} />
          </div>
        </div>
      </section>
    </>
  );
}