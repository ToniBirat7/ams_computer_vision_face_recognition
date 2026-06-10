# BCU AMS — Working Pipeline

> Outside the markers below is human-owned. The pulse skill only rewrites content
> between the sentinels, leaving your notes intact.

## Dev / build / deploy flow

_How you run, build, test, and ship this project._

<!-- pulse:auto:start -->
Build Django + Next.js images -> push artifacts -> deploy to VM behind nginx (localhost:8080) at bcuams.biratcodes.dev; ML models bundled for face-rec + grade prediction.
<!-- pulse:auto:end -->
