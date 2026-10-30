import { all, create } from "mathjs";

/**
 * Create an independent, seeded pseudo-random generator.
 *
 * The returned function yields a number in `[0, max)`, where `max` defaults to 1.
 *
 * Prefer a generator per data set over one shared between them. A shared generator
 * makes its output depend on how many numbers earlier callers already drew, which is
 * not reproducible: Storybook renders every story into one page, so the draw count
 * varies with story order, sharding and re-renders.
 */
export function createSeededRandom(
    seed: string = "1984"
): (max?: number) => number {
    const math = create(all, { randomSeed: seed });
    const random = math?.random ?? Math.random;
    return (max = 1) => random() * max;
}
