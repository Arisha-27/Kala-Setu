from pydantic import BaseModel
from typing import List

class Trend(BaseModel):
    title: str
    description: str
    level: str
    momentum: str
    timeFrame: str
    actions: List[str]


