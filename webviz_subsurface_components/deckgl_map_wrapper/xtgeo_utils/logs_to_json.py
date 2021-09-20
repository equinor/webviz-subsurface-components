from typing import Dict, Optional, Any

from xtgeo import Well


class XtgeoLogsJson:
    def __init__(self, well: Well, name: str = None, logrun: str = "log"):
        self._well = well
        self._name = name if name else well.name
        self._logrun = logrun
        if well.mdlogname is None:
            well.geometrics()

    @property
    def _log_names(self):
        return [
            logname
            for logname in self._well.lognames
            if logname not in ["Q_MDEPTH", "Q_AZI", "Q_INCL", "R_HLEN"]
        ]

    def _generate_curves(self):
        curves = []

        # Add MD and TVD curves
        curves.append(self._generate_curve(log_name="MD", description="Measured depth"))
        curves.append(
            self._generate_curve(log_name="TVD", description="True vertical depth (SS)")
        )
        # Add additonal logs, skipping geometrical logs if calculated

        for logname in self._log_names:
            curves.append(self._generate_curve(log_name=logname.upper()))
        return curves

    def _generate_data(self):
        # Filter dataframe to only include relevant logs
        curve_names = [self._well.mdlogname, "Z_TVDSS"] + self._log_names

        dframe = self._well.dataframe[curve_names]
        dframe = dframe.reindex(curve_names, axis=1)
        return dframe.values.tolist()

    def _generate_header(self) -> Dict[str, Any]:
        return {
            "name": self._logrun,
            "well": self._name,
            "wellbore": None,
            "field": None,
            "country": None,
            "date": None,
            "operator": None,
            "serviceCompany": None,
            "runNumber": None,
            "elevation": None,
            "source": None,
            "startIndex": None,
            "endIndex": None,
            "step": None,
            "dataUri": None,
        }

    @staticmethod
    def _generate_curve(
        log_name: str, description: Optional[str] = None, value_type: str = "float"
    ) -> Dict[str, Any]:
        return {
            "name": log_name,
            "description": description,
            "valueType": value_type,
            "dimensions": 1,
            "unit": "m",
            "quantity": None,
            "axis": None,
            "maxSize": 20,
        }

    @property
    def data(self):
        return [
            {
                "header": self._generate_header(),
                "curves": self._generate_curves(),
                "data": self._generate_data(),
            }
        ]
