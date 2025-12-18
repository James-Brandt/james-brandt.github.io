---
layout: single
title: "Optimising Brake Bias in Formula 1: A Physics-Based Mini-Project"
date: 2025-11-12
excerpt: "Modelling and optimising front-axle brake bias for F1-style corner entries using vehicle dynamics and simulation-based code."
author_profile: true
read_time: true
toc: true
toc_sticky: true
math: true
---

## Rationale

Dynamic brake proportioning (brake bias) is essential for optimising F1 lap performance. This precise calibration of braking force between the front and rear axles is critical for transient vehicle stability, directly contributing to marginal time gains. Drivers must continuously adjust the bias mid-lap to compensate for fluctuating vehicle speed, corner geometry, tyre grip conditions, and, critically, the decay of aerodynamic downforce. Nominal dry bias often sits near 60% front / 40% rear.

For engineering platforms, this topic offers an ideal synergy: it connects vehicle dynamics (weight transfer, tyre friction) with control optimisation, inspired by F1 racing. This allows for the development of a rudimentary analytical model, computational implementation, and the technical storytelling of how optimal bias varies with corner severity.

## Background Information

### What is Brake Bias?

Brake bias defines the ratio of total braking force distributed between the front and rear axles. For instance, 55% front / 45% rear means 55% of the deceleration force is channelled to the front. F1 drivers use steering wheel controls for real-time adjustments to compensate for operational changes such as tyre wear, fuel load depletion, and corner-specific requirements. The requirement for front-axle bias is a physical necessity driven by the following factors:

- Longitudinal Load Transfer: Upon braking, rapid longitudinal load transfer immediately elevates the normal load on the front tyres while diminishing the load on the rear.

- Friction Ellipse Constraint: Tyre performance is constrained by the friction ellipse, where the capacity for longitudinal (braking), and lateral (cornering) force generation is finite. This demand trade-off is most pronounced during trail-braking.

- Stability Constraint: The optimal bias must be precisely constrained to maintain stability. Excessive front bias risks premature lock-up and compromised directional control, while excessive rear bias induces rear wheel lock-up, severe instability, and the potential for a rotational spin.

The optimal bias is the precise equilibrium point where both axles operate at their maximum available friction limit without exceeding it.

### Mathematical Model

This mathematical model employs the following equations and simplifications:

- The car mass $m$, wheelbase $L$, centre-of-gravity (CoG) height $h_{cg}$, and front-wheel CoG distance $a_{cg}$ are fixed.

- Static normal loads on front and rear axles are given by simple lever arm of weight distribution:

$$
N_{f,static} = m \times g \times \frac{L - a_{cg}}{L}, N_{r,static} = m \times g \times \frac{a_{cg}}{L}
$$

- Under braking deceleration $a_{x}$ the longitudinal transfer is:

$$
\Delta N = \frac{m \times a_{x} \times h_{cg}}{L}
$$

- Aero downforce on each axle is approximated as $D = \frac{1}{2} \rho A C_{l} v^{2}$ , separated into front & rear fractions.

- Lateral acceleration $a_{y}$ is derived from corner radius $R$ and entry speed $v$: $a_{y} = \frac{v^{2}}{R}$. That gives lateral force total $F_{y,total} = m \times a_{y}$. A split of lateral load between front and rear axles is henced assumed.

- For each axle: remaining braking (longitudinal) capacity is computed using a simplified friction circle (where $\mu$ is peak tyre friction assumed equal front/rear in this model):

$$
F_{f,max} = \sqrt{(\mu \times N)^{2} - (F_{y,used})^{2}}
$$

- The total braking force required: $F_{x,total} = m \times a_{x}$.

- With clamping between 0 and 1, optimum front bias fraction is:

$$
bias_{front} = \frac{F_{x,front,max}}{F_{x,front,max} + F_{x,rear,max}}
$$

- The search range (for realism) is set to be 45% to 60% front.

### Assumptions, Inclusions and Omissions 
- The following factors are omitted: variation of friction for front and rear tyres, thermal effects, compound differences, dynamic tyre load sensitivity, transient effects of weight transfer (pitch/roll), brake-by-wire and hybrid regeneration effects, driver behaviour (trail-braking vs pure brake then turn).

- It is assumed that the car is at steady entry speed, applying a constant deceleration and then cornering; the full lap, nor, dynamic transitions are not modelled.

- The model neglects engine braking, temperature changes, tyre wear, path variation and bumpiness.

## Methodology

### Code Overview
Below are critical snippets (Python style) of the key functions used in the project.

```python
# Static normal loads
def static_normal_loads(m, g, L, a_cg):
    Nf = m * g * (L - a_cg) / L
    Nr = m * g * (a_cg)      / L
    return Nf, Nr

# Longitudinal load transfer
def longitudinal_load_transfer(m, ax_brake, h_cg, L):
    return m * ax_brake * h_cg / L

# Aero downforce functions
def Df_front(v):
    return 0.5 * rho * A * Cl_front * v**2

def Df_rear(v):
    return 0.5 * rho * A * Cl_rear  * v**2

# Friction circle remaining braking force
def friction_circle_remaining_longitudinal(mu, N_axle, Fy_used):
    term = (mu * N_axle)**2 - Fy_used**2
    if term < 0:
        return 0.0
    return math.sqrt(term)

# Compute brake bias
def compute_brake_bias_from_radius(v_entry, R_corner, ax_brake, **kwargs):
    ay_target = v_entry**2 / R_corner
    return compute_brake_bias(v_entry = v_entry, ay_target = ay_target, ax_brake = ax_brake, **kwargs)
```

### Full Process and Experimentation
1. Define car parameters (mass, geometry, aero coefficients, tyre friction coefficient, brake bias search range).
2. Build the model functions for load transfer, aero load, lateral force split, braking capacity per axle.
3. For each trial input (entry speed $v$, corner radius $R$, deceleration $a_{x}$) compute optimum front bias fraction.
4. Compare experimental brake bias values to predicted values.

## Results & Analysis

### Experimental Trials

Three distinct trials were tested to evaluate the accuracy and precision of the model:
1. Trial A: Heavy braking zone from high speed into tight corner. $v_{entry}$ = 90m/s, $R_{corner}$ = 60m, $a_{x,brake}$ = 4.5g.
2. Trial B: Medium braking zone, moderate speed and radius. $v_{entry}$ = 70m/s, $R_{corner}$ = 120m, $a_{x,brake}$ = 3.5g.
3. Trial C: Light braking into flowing corner. $v_{entry}$ = 60m/s, $R_{corner}$ = 200m, $a_{x,brake}$ = 2.5g.

| Trial | Experimental Bias (front %) | Expected Bias (front %) | % Difference | Commentary |
|-------|-----------------------------|--------------------------|--------------|------------|
| A     | 50.00 %                     | 55.0 %                   | −9.09 %      | This bias is somewhat lower than typical (~55-60% front) for heavy braking. This suggests the scenario may be under-braking or the lateral demand is high relative to decel, reducing front bias requirement. |
| B     | 62.01 %                     | 60.0 %                   | +3.35 %      | This is somewhat higher than typical quoted values, but still plausible given a very heavy braking scenario. It suggests a high front load transfer or relatively low rear braking capacity in that scenario. |
| C     | 59.73 %                     | 60.0 %                   | −0.45 %      | This result lies nicely within the typical “~60% front” range quoted by F1 setup guides. It is a reasonably that good sign that the model is behaving realistically. |

<p class="text-center" style="font-size:0.65rem;">
  <strong>Table 1:</strong> Table of results of the three test trials, including the percentage difference between the expected bias values and the experimental bias values.
</p>

### Interpretation
- The results show that the model produces different optimal biases for the different corner scenarios, which is exactly the intent.
- Trial A at 50% suggests a scenario with relatively lesser deceleration/weight transfer or higher lateral demand such that the front bias requirement drops.
- Trial B’s 62% suggests the scenario likely involved more deceleration, stronger load transfer or less lateral load share for the rear. It may indicate the input values represent an unusually heavy braking zone.
- Trial C aligns closely with commonly quoted front bias values (~50-60% front) in real F1 practice.

### Real-World Comparison
Because there are no publicly published ideal bias percentages for specific F1 corners (entry speed, radius, and deceleration), the absolute accuracy of the model can’t be validated against real telemetry. What matters instead is the credibility of the results; that is, that they lie within plausible ranges, the variation makes sense, and the trend is correct.

The results span from 50 to 62% front bias and centre around 60%, which is consistent with what F1 guides say: front bias typically around 50-60% (but can be more front for heavy braking, less front for lighter/braking and cornering).

## Evaluation

### Strengths
- The results are reasonable and vary with input corner severity, indicating a successful correlation between the input variables and the brake bias ratio.

- The model captures key physics concepts in F1: deceleration, weight shift, tyre load, and friction.

## Weaknesses
- The tyre model is very simplified: uniform $\mu$ front & rear, no temperature/compound/wear variation, no transient dynamics (the weight transfer is instantaneous).

- Brake by wire and hybrid energy recovery (which affect rear braking load in modern F1 cars) are omitted. The rear braking in F1 is partly handled by engine braking and ERS, so the simple rear braking force assumption is an approximation.

- The scenario inputs (entry speed, radius, decel) were not tied to publicly-verified data with known bias values. Without “ground truth” bias values for those corners, the model cannot be validated beyond plausibility.

## Conclusion

This mini-project has shown that by capturing the basic physics of braking, weight transfer, lateral vs longitudinal tyre demand and aerodynamic load, one can build a simple yet able model to predict optimal brake bias for a car in a cornering-braking scenario. Although the model cannot be validated against published corner-specific bias values (which are not publicly available), the results are credible: they sit in the expected range (~50–60% front), and they vary in sensible ways between different corner severity cases.

## References

- Flow Racers. (2023, April 4). What is brake bias in F1? (Fully explained). FlowRacers. [https://www.flowracers.com/blog/f1-brake-bias/](https://www.flowracers.com/blog/f1-brake-bias/)
- Formulapedia. (2022, October 2). What is brake balance in F1? (Brake bias explained). Formulapedia. [https://www.formulapedia.com/brake-balance-in-f1/](https://www.formulapedia.com/brake-balance-in-f1/)
- Las Motorsport. (2024). Brake balance in F1: What you need to know. Las Motorsport. [https://las-motorsport.com/f1/blog/brake-balance-in-f1-what-you-need-to-know/3997/](https://las-motorsport.com/f1/blog/brake-balance-in-f1-what-you-need-to-know/3997/)
- Mercedes-AMG Petronas F1. (n.d.). Formula One brake systems, explained! Mercedes-AMG Petronas F1 Team. [https://www.mercedesamgf1.com/news/formula-one-brake-systems-explained/](https://www.mercedesamgf1.com/news/formula-one-brake-systems-explained/)
