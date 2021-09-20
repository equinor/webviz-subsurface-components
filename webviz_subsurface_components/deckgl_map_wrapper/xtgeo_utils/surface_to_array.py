from typing import List, Dict, Optional, Any

import numpy as np
from xtgeo import RegularSurface

from ._array2d_to_png import array2d_to_png


class XtgeoSurfaceArray:
    # pylint: disable=too-many-arguments
    def __init__(
        self,
        surface: RegularSurface,
        unrotate: bool = True,
        flip: bool = True,
        clip_min: float = None,
        clip_max: float = None,
    ) -> None:
        self._zarray = self._get_zarray(
            surface=surface,
            unrotate=unrotate,
            flip=flip,
            clip_min=clip_min,
            clip_max=clip_max,
        )
        self._map_bounds = [surface.xmin, surface.ymin, surface.xmax, surface.ymax]
        self._view_target = self._get_view_target(surface)

    @property
    def map_bounds(self) -> list:
        return self._map_bounds

    @property
    def view_target(self) -> list:
        return self._view_target

    @property
    def map_image(self) -> str:
        return array2d_to_png(self._scaled_zarray.copy())

    @property
    def min_val(self) -> float:
        return np.nanmin(self._zarray)

    @property
    def max_val(self) -> float:
        return np.nanmax(self._zarray)

    @property
    def _scaled_zarray(self) -> np.ndarray:
        return (self._zarray - self.min_val) * self._scale_factor

    @property
    def _scale_factor(self) -> float:
        if self.min_val == 0.0 and self.max_val == 0.0:
            return 1.0
        return (256 * 256 * 256 - 1) / (self.max_val - self.min_val)

    @staticmethod
    def _get_view_target(surface) -> list:
        width = surface.xmax - surface.xmin
        height = surface.ymax - surface.ymin
        return [surface.xmin + width / 2, surface.ymin + height / 2, 0]

    @staticmethod
    def _get_zarray(
        surface,
        unrotate: bool = True,
        flip: bool = True,
        clip_min: float = None,
        clip_max: float = None,
    ) -> np.ndarray:
        surface = surface.copy()
        if clip_min or clip_max:
            np.ma.clip(surface.values, clip_min, clip_max, out=surface.values)  # type: ignore
        if unrotate:
            surface.unrotate()
        surface.fill(np.nan)
        values = surface.values
        if flip:
            values = np.flip(values.transpose(), axis=0)
        # If all values are masked set to zero
        if values.mask.all():
            values = np.zeros(values.shape)
        return values
