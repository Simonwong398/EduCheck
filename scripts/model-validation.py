import tensorflow as tf
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score, 
    confusion_matrix
)

class ModelValidator:
    def __init__(self, model_path):
        self.model = tf.keras.models.load_model(model_path)
        self.results = {}

    def load_validation_data(self, data_path):
        """加载验证数据集"""
        data = pd.read_csv(data_path)
        X = data.drop('target', axis=1).values
        y = data['target'].values
        
        # 划分训练集和测试集
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        return X_train, X_test, y_train, y_test

    def predict(self, X_test):
        """模型预测"""
        predictions = self.model.predict(X_test)
        return (predictions > 0.5).astype(int).flatten()

    def evaluate_model(self, y_test, predictions):
        """评估模型性能"""
        self.results = {
            'accuracy': accuracy_score(y_test, predictions),
            'precision': precision_score(y_test, predictions),
            'recall': recall_score(y_test, predictions),
            'f1_score': f1_score(y_test, predictions),
            'confusion_matrix': confusion_matrix(y_test, predictions)
        }
        return self.results

    def generate_report(self):
        """生成模型验证报告"""
        report = f"""
机器学习模型验证报告
====================

模型性能指标:
- 准确率: {self.results['accuracy']:.2%}
- 精确率: {self.results['precision']:.2%}
- 召回率: {self.results['recall']:.2%}
- F1得分: {self.results['f1_score']:.2%}

混淆矩阵:
{self.results['confusion_matrix']}

性能建议:
{self._generate_recommendations()}
"""
        return report

    def _generate_recommendations(self):
        """根据模型性能生成改进建议"""
        recommendations = []
        
        if self.results['accuracy'] < 0.7:
            recommendations.append("- 考虑增加训练数据集规模")
            recommendations.append("- 尝试调整模型架构")
        
        if self.results['precision'] < 0.6:
            recommendations.append("- 优化特征工程")
            recommendations.append("- 减少数据噪声")
        
        if self.results['recall'] < 0.6:
            recommendations.append("- 平衡正负样本")
            recommendations.append("- 使用过采样或欠采样技术")
        
        return "\n".join(recommendations) if recommendations else "模型性能良好，无需特殊优化"

def main():
    model_path = '/path/to/recommendation_model'
    data_path = '/path/to/validation_dataset.csv'

    validator = ModelValidator(model_path)
    X_train, X_test, y_train, y_test = validator.load_validation_data(data_path)
    
    # 可选：模型微调
    validator.model.fit(X_train, y_train, epochs=10, validation_split=0.2)
    
    predictions = validator.predict(X_test)
    validator.evaluate_model(y_test, predictions)
    
    report = validator.generate_report()
    
    # 保存报告
    with open('model_validation_report.txt', 'w') as f:
        f.write(report)
    
    print("模型验证完成，报告已生成。")

if __name__ == "__main__":
    main()
