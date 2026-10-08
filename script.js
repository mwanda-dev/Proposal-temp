import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { WebHaptics, defaultPatterns } from "web-haptics";

// medium impact

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".sticky-cards .card");
    const titleWords = new Map();
    let activeCardIndex = -1;
    let activeCardTween;

    document.fonts.ready.then(() => {
        const headings = document.querySelectorAll(
            ".intro-text, .sticky-cards .card h1, .outro-text",
        );

        headings.forEach((heading) => {
            const split = SplitText.create(heading, {
                type: "words",
                mask: "words",
                wordsClass: "word",
            });
            titleWords.set(heading, split.words);
        });

        cards.forEach((card) => {
            const heading = card.querySelector("h1");
            const words = heading && titleWords.get(heading);
            if (words) {
                gsap.set(words, { yPercent: 110, scale: 0.55, autoAlpha: 0 });
            }
        });

        document.querySelectorAll(".intro-text, .outro-text").forEach((heading) => {
            gsap.fromTo(
                titleWords.get(heading),
                { yPercent: 110, scale: 0.55, autoAlpha: 0 },
                {
                    yPercent: 0,
                    scale: 1,
                    autoAlpha: 1,
                    duration: 0.65,
                    stagger: 0.04,
                    ease: "osmo-ease",
                    transformOrigin: "center left",
                    scrollTrigger: {
                        trigger: heading,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                },
            );
        });

        if (activeCardIndex >= 0) {
            animateCardHeading(activeCardIndex);
        }
    });

    function animateCardHeading(index) {
        const heading = cards[index]?.querySelector("h1");
        const words = heading && titleWords.get(heading);

        if (!words) return;

        activeCardTween?.kill();
        activeCardTween = gsap.fromTo(
            words,
            { yPercent: 110, scale: 0.55, autoAlpha: 0 },
            {
                yPercent: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 0.65,
                stagger: 0.04,
                ease: "osmo-ease",
                transformOrigin: "center left",
            },
        );
    }

    function resetCardHeading(index) {
        const heading = cards[index]?.querySelector("h1");
        const words = heading && titleWords.get(heading);

        if (words) {
            gsap.set(words, { yPercent: 110, scale: 0.55, autoAlpha: 0 });
        }
    }

    const haptics = new WebHaptics();
    const yesButton = document.getElementById("yesButton");
    yesButton.addEventListener("click", () => {
        haptics.trigger([
  { duration: 30 },
  { delay: 60, duration: 40, intensity: 2 },
]);
        createConfettiSplash(yesButton);
    });

    const lenis = new Lenis({
        // syncTouch: true,
        // touchMultiplier: 1.35,
        // infinite: true,
        // orientation: "horizontal",
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const totalCards = cards.length;
    const segmentSize = 1 / totalCards;
    const endProgress = (totalCards - 0.4) / totalCards;

    const cardYOffset = 5;
    const cardScaleStep = 0.075;

    //Initial positioning
    cards.forEach((card, i) => {
        gsap.set(card, {
            xPercent: -50,
            yPercent: -50 + i * cardYOffset,
            scale: 1 - i * cardScaleStep,
        });
    });

    const button = document.getElementById("evadeButton");
    const section = button.closest("section");
    let hasStartedDodging = false;

    button.addEventListener("mouseover", dodging_button);
    button.addEventListener("touchstart", (_) => {
        haptics.trigger([
            { duration: 70 },
            { delay: 90, duration: 60, intensity: 1 },
            { delay: 90, duration: 190, intensity: 1 },
        ]);
        dodging_button();
    });

    function dodging_button() {
        if (!hasStartedDodging) {
            const buttonRect = button.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();

            button.style.position = "absolute";
            button.style.left = "0";
            button.style.top = "0";
            gsap.set(button, {
                x: buttonRect.left - sectionRect.left,
                y: buttonRect.top - sectionRect.top,
            });
            hasStartedDodging = true;
        }

        const maxX = section.clientWidth - button.offsetWidth;
        const maxY = section.clientHeight - button.offsetHeight;

        gsap.to(button, {
            x: Math.random() * maxX,
            y: Math.random() * maxY,
            duration: 0.24,
            ease: "power4.out",
        });
    }

    function createConfettiSplash(origin) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
            console.error("Unable to create the confetti canvas context.");
            return;
        }

        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        Object.assign(canvas.style, {
            position: "fixed",
            inset: "0",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: "9999",
        });
        context.scale(pixelRatio, pixelRatio);
        document.body.appendChild(canvas);

        const bounds = origin.getBoundingClientRect();
        const originX = bounds.left + bounds.width / 2;
        const originY = bounds.top + bounds.height / 2;
        const colors = ["#574AE2", "#222a68", "#654597", "#ab81cd", "#f4d35e"];
        const particles = Array.from({ length: 100 }, () => ({
            x: originX,
            y: originY,
            velocityX: (Math.random() - 0.5) * 14,
            velocityY: -Math.random() * 12 - 3,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.24,
            size: Math.random() * 7 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));
        let previousTime = performance.now();
        const duration = 1800;

        function renderConfetti(time) {
            const delta = Math.min((time - previousTime) / 16.67, 2);
            previousTime = time;
            context.clearRect(0, 0, width, height);

            particles.forEach((particle) => {
                particle.x += particle.velocityX * delta;
                particle.y += particle.velocityY * delta;
                particle.velocityY += 0.22 * delta;
                particle.rotation += particle.rotationSpeed * delta;

                context.save();
                context.translate(particle.x, particle.y);
                context.rotate(particle.rotation);
                context.fillStyle = particle.color;
                context.fillRect(
                    -particle.size / 2,
                    -particle.size / 2,
                    particle.size,
                    particle.size * 0.65,
                );
                context.restore();
            });

            if (time - startTime < duration) {
                requestAnimationFrame(renderConfetti);
            } else {
                canvas.remove();
            }
        }

        const startTime = performance.now();
        requestAnimationFrame(renderConfetti);
    }

    ScrollTrigger.create({
        trigger: ".sticky-cards",
        start: "top top",
        end: `+=${window.innerHeight * 8 * endProgress}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress * endProgress;

            // The currently animating card based on the scroll progress
            const activeIndex = Math.min(
                Math.floor(progress / segmentSize),
                totalCards - 1,
            );

            if (activeIndex !== activeCardIndex) {
                if (activeCardIndex >= 0) {
                    resetCardHeading(activeCardIndex);
                }
                activeCardIndex = activeIndex;
                animateCardHeading(activeIndex);
            }

            const segmentProgress =
                (progress - activeIndex * segmentSize) / segmentSize;

            cards.forEach((card, i) => {
                if (i < activeIndex) {
                    gsap.set(card, {
                        yPercent: -250,
                        rotateX: 35,
                        // rotateY: -35,
                    });
                } else if (i === activeIndex) {
                    gsap.set(card, {
                        yPercent: gsap.utils.interpolate(
                            -50,
                            -200,
                            segmentProgress,
                        ),
                        rotationX: gsap.utils.interpolate(
                            0,
                            35,
                            segmentProgress,
                        ),
                        // rotationY: gsap.utils.interpolate(
                        //     0,
                        //     -35,
                        //     segmentProgress,
                        // ),
                        scale: 1,
                    });
                } else {
                    const behindIndex = i - activeIndex;
                    const currentYOffset =
                        (behindIndex - segmentProgress) * cardYOffset;
                    const currentScale =
                        1 - (behindIndex - segmentProgress) * cardScaleStep;

                    gsap.set(card, {
                        yPercent: -50 + currentYOffset,
                        rotationX: 0,
                        // rotationY: 0,
                        scale: currentScale,
                    });
                }
            });
        },
    });
});
