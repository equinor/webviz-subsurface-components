export function checkMinMaxValue(
    minmax: [number, number],
    value: number
): void {
    if (value !== null) {
        if (minmax[0] === Number.POSITIVE_INFINITY)
            minmax[0] = minmax[1] = value;
        else if (minmax[0] > value) minmax[0] = value;
        else if (minmax[1] < value) minmax[1] = value;
    }
}

export function checkMinMax(
    minmax: [number, number],
    minmaxSrc: [number, number]
): void {
    if (minmax[0] === Number.POSITIVE_INFINITY) {
        minmax[0] = minmaxSrc[0];
        minmax[1] = minmaxSrc[1];
    } else {
        if (minmax[0] > minmaxSrc[0]) minmax[0] = minmaxSrc[0];
        if (minmax[1] < minmaxSrc[1]) minmax[1] = minmaxSrc[1];
    }
}

export function roundMinMax(minmax: [number, number]): [number, number] {
    const kmin = 6; // a minimal number of intervals
    const kmax = 9; // a maximal number of intervals

    let mi = minmax[0];
    let ma = minmax[1];

    if (!isFinite(mi) || !isFinite(ma)) return [mi, ma];

    if (!mi && !ma)
        // some special case of absolutly round values (zeroes)
        return [mi, ma];

    let d = ma - mi;
    if (d < 0) return [mi, ma];
    if (!d) d = 1;
    else {
        // avoid rounding of already near round values (some round decimals do not have exact the binary representation)
        ma = ma - d * 0.0000001;
        mi = mi + d * 0.0000001;
        d = ma - mi;
    }
    const l0 = Math.floor(Math.log10(d));
    let p = Math.pow(10, l0 + 1);
    let c = (mi + d * 0.5) / p;
    if (Math.abs(c) > 1e9) c *= p;
    else c = Math.floor(c) * p;
    let q = 0.5;
    let l = l0;

    let k1 = 0,
        k2 = 0;
    let k = k2 - k1;
    for (; l > -20 /*-30*/; l--) {
        p = p * 0.1;
        while (q >= 0.5) {
            d = p * q;
            k2 = Math.floor((ma - c) / d);
            if (ma >= c) k2++;
            k1 = Math.floor((mi - c) / d);
            if (mi < c) k1--;
            k = k2 - k1;
            if (k >= kmax) break;
            q = q * 0.5;
        }
        if (k >= kmax) break;
        q = 2.0;
    }
    if (k >= kmax) {
        for (; l < l0; l++) {
            while (q <= 2.0) {
                d = p * q;
                k2 = Math.floor((ma - c) / d);
                if (ma >= c) k2++;
                k1 = Math.floor((mi - c) / d);
                if (mi < c) k1--;
                k = k2 - k1;
                if (k <= kmax) break;
                q = q * 2.0;
            }
            if (k <= kmax) break;
            q = 0.5;
            p = p * 10;
        }
    }
    if (k < kmin) {
        const j = q === 2.0 ? 5 : 2;
        if (k1 >= 0) k = (k1 / j) * j;
        else k = ((k1 - j + 1) / j) * j;
        if (k2 - k > kmin) {
            if (k2 < 0) k = (k2 / j) * j;
            else k = ((k2 + j - 1) / j) * j;
            if (k - k1 > kmin) k2 = (k2 + k1 + kmin) / 2;
            else k2 = k;
        } else {
            k1 = k2 - kmin;
            k2 = k1 + kmin;
        }
        k1 = k;
    }
    const a = k1 * d + c;
    const b = k2 * d + c;
    return [parseFloat(a.toPrecision(5)), parseFloat(b.toPrecision(5))];
}

export function roundLogMinMax(minmax: [number, number]): [number, number] {
    const r = roundMinMax(minmax);
    /* TODO: make Log version
      const ret = roundMinMax([Math.log10(minmax[0]), Math.log10(minmax[1])]);
      //const a=Math.pow(10, ret[0]), b=Math.pow(10, ret[1]);
      */
    if (r[0] <= 0) {
        // avoid non-positive values
        r[0] = minmax[0];
        if (r[0] <= 0) {
            // could not show negative data!
            console.error("Wrong data range for logarithm scale " + minmax);
        }
    }
    return [parseFloat(r[0].toPrecision(5)), parseFloat(r[1].toPrecision(5))];
}
