import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { WebHaptics, defaultPatterns } from "web-haptics";

// medium impact

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
    const haptics = new WebHaptics();
    const lenis = new Lenis({
        syncTouch: true,
        touchMultiplier: 1.35,
        // infinite: true,
        // orientation: "horizontal",
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const cards = document.querySelectorAll(".sticky-cards .card");
    const totalCards = cards.length;
    const segmentSize = 1 / totalCards;

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

    ScrollTrigger.create({
        trigger: ".sticky-cards",
        start: "top top",
        end: `+=${window.innerHeight * 8}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;

            // The currently animating card based on the scroll progress
            const activeIndex = Math.min(
                Math.floor(progress / segmentSize),
                totalCards - 1,
            );

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
