from sympy import symbols, Eq, solve, latex
from sympy.parsing.latex import parse_latex
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/solve_equation', methods=['POST'])
def solve_equation():
    latex_equation = request.json.get('latex_equation', '')
    try:
        # 解析LaTeX公式
        equation = parse_latex(latex_equation)
        # 假设公式是等式，分离左右两边
        lhs, rhs = equation.lhs, equation.rhs
        # 求解
        solutions = solve(Eq(lhs, rhs))
        # 生成解题步骤
        steps = [f"Equation: {latex(lhs)} = {latex(rhs)}"]
        steps.append(f"Solutions: {solutions}")
        return jsonify(steps=steps, solutions=[str(sol) for sol in solutions])
    except Exception as e:
        return jsonify(error=str(e)), 400

if __name__ == '__main__':
    app.run(port=5001)
