import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.animation as animation
from math import sqrt

# Gradient descent parameters
alpha = 0.7  # Learning rate
x_start = 5.0  # Starting point (you can change this)
iterations = 50  # Number of iterations
x_vals = [x_start]  # List to store x values over iterations
x_vals2 = [x_start]  # List to store x values over iterations

# Function and its gradient
def f(x):
    return 0.5 * x**2

def grad_f(x):
    return x  # Gradient of f(x) = x^2 / 2 is f'(x) = x

# OGM
x = x_start
for _ in range(iterations):
    gradient = grad_f(x)
    x = x - alpha*gradient
    x_vals2.append(x)

# OGM
x = x_start
z = x
theta = 1
for _ in range(iterations):
    gradient = grad_f(x)
    y = x - gradient
    z = z - 2*theta*gradient
    theta = (1+sqrt(1+8*theta**2))/2
    x = (1-1/theta) * y + z / theta
    x_vals.append(x)

# Set up the figure and axis
fig, axs = plt.subplots(2)


ax = axs[0]
x_line = np.linspace(-6, 6, 1000)
performance1 = np.log(f(np.array(x_vals)))
performance2 = np.log(f(np.array(x_vals2)))
axs[1].set_xlim(left=0, right=iterations)
axs[1].set_ylim(top=0, bottom=-100)
plot1, = axs[1].plot([], label="OGM", color="red")
plot2, = axs[1].plot([], label="Gradient Descent", color="blue")
y_line = 0.5 * x_line**2
ax.plot(x_line, y_line, label=r"$f(x) = \frac{x^2}{2}$", color='blue')
ax.set_xlim(-6, 6)
ax.set_ylim(0, 20)
ax.set_xlabel('x')
ax.set_ylabel('f(x)')
ax.set_title('Gradient Descent on $f(x) = \\frac{x^2}{2}$')

# Point initialization
point, = ax.plot([], [], 'ro', label='OGM')
point2, = ax.plot([], [], 'bo', label='Gradient Descent')

# Update function for the animation
def update(frame):
    point.set_data([x_vals[frame]], [f(x_vals[frame])])
    point2.set_data([x_vals2[frame]], [f(x_vals2[frame])])
    plot1.set_xdata(list(range(frame)))
    plot1.set_ydata(performance1[:frame])
    plot2.set_xdata(list(range(frame)))
    plot2.set_ydata(performance2[:frame])
    return [point, point2, plot1, plot2]

plt.legend()
# Create the animation
ani = FuncAnimation(fig, update, frames=range(len(x_vals)), interval=500, blit=True)
writervideo = animation.FFMpegWriter(fps=5)
ani.save('ogm_vs_gd.mp4', writer=writervideo)
plt.close()

