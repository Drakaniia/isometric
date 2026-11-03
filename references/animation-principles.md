# Animation principles

Motion is authored in Drawing.motion: duration in seconds plus tracks naming part groups. A track has translation t, rotation r (axis, degrees, world pivot), or scale s (vector and pivot). Optional from/to windows lie in 0..1. Default yoyo moves out and back; loop wraps continuously. Easing is linear, inOut, in, out or back.

Render intermediate frames with render(model,{phase}). The kit transforms geometry and recomputes visibility and depth order. Never spin a gear or hinged lid in screen coordinates. Related mechanisms share a clock; gear speed ratios follow tooth counts.

Use one meaningful micro-motion: a lid opens, paper feeds, a button presses. The rest pose is complete. Gallery hover and keyboard focus play motion; autoplay is opt-in and visible drawings only. Reduced motion must stop it. An exported React component uses complete precomputed depth-sorted frames, so its output can be larger than a still.

Test rest, quarter, half and three-quarter phases across facing/pose. Continuous or long motion needs an accessible stop mechanism; prefer brief hover actions when no pause UI exists. Do not claim a physical simulation for illustrative movement.
