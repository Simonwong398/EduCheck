#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 测试前准备
echo -e "${GREEN}准备运行单元测试...${NC}"
npm install

# 运行前端组件测试
echo -e "${GREEN}开始前端组件测试...${NC}"
npm run test:components

# 运行后端服务测试
echo -e "${GREEN}开始后端服务测试...${NC}"
npm run test:services

# 运行机器学习模型测试
echo -e "${GREEN}开始机器学习模型测试...${NC}"
npm run test:ml-models

# 生成测试覆盖率报告
echo -e "${GREEN}生成测试覆盖率报告...${NC}"
npm run test:coverage

# 检查测试结果
if [ $? -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！${NC}"
else
    echo -e "${RED}存在测试失败，请检查详细报告。${NC}"
    exit 1
fi
