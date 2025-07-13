#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
随机生成Git Commit记录脚本
时间范围：2023年8月 - 2025年6月
"""

import random
import datetime
import subprocess
import os
import sys

class GitCommitGenerator:
    def __init__(self):
        # 定义常见的commit消息模板
        self.commit_messages = [
            "feat: add new feature",
            "fix: resolve bug in authentication",
            "docs: update README",
            "style: format code",
            "refactor: optimize database queries",
            "test: add unit tests",
            "chore: update dependencies",
            "feat: implement user dashboard",
            "fix: handle edge case in payment",
            "docs: add API documentation",
            "style: improve UI components",
            "refactor: clean up legacy code",
            "test: add integration tests",
            "feat: add search functionality",
            "fix: resolve memory leak",
            "docs: update installation guide",
            "chore: bump version to",
            "feat: implement real-time notifications",
            "fix: correct validation logic",
            "style: update color scheme",
            "refactor: modularize components",
            "test: improve test coverage",
            "feat: add multi-language support",
            "fix: resolve cross-browser compatibility",
            "docs: add troubleshooting section",
            "chore: clean up unused files",
            "feat: implement caching mechanism",
            "fix: handle network timeout",
            "style: responsive design improvements",
            "refactor: extract utility functions",
            "test: add performance tests",
            "feat: add export functionality",
            "fix: resolve data synchronization issue",
            "docs: update configuration guide",
            "chore: update build scripts",
            "feat: implement dark mode",
            "fix: correct timezone handling",
            "style: improve accessibility",
            "refactor: optimize rendering performance",
            "test: add end-to-end tests"
        ]
        
        # 定义时间范围
        self.start_date = datetime.datetime(2023, 8, 1)
        self.end_date = datetime.datetime(2025, 6, 30)
        
        # 定义一些示例文件用于修改
        self.sample_files = [
            "README.md",
            "package.json",
            "index.ts",
            "utils/utils.ts",
            "utils/tradingUtils.ts",
            "src/main.js",
            "src/components/Header.js",
            "src/utils/api.js",
            "docs/api.md",
            "tests/unit.test.js"
        ]

    def generate_random_date(self):
        """生成随机日期"""
        time_between = self.end_date - self.start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        random_date = self.start_date + datetime.timedelta(days=random_days)
        
        # 添加随机时间
        random_hour = random.randint(0, 23)
        random_minute = random.randint(0, 59)
        random_second = random.randint(0, 59)
        
        return random_date.replace(
            hour=random_hour, 
            minute=random_minute, 
            second=random_second
        )

    def get_random_commit_message(self):
        """获取随机commit消息"""
        return random.choice(self.commit_messages)

    def create_dummy_change(self):
        """创建一个虚拟的文件更改"""
        # 随机选择一个文件
        filename = random.choice(self.sample_files)
        
        # 确保目录存在
        dir_path = os.path.dirname(filename)
        if dir_path and not os.path.exists(dir_path):
            os.makedirs(dir_path, exist_ok=True)
        
        # 创建或修改文件
        if os.path.exists(filename):
            # 如果文件存在，添加一行注释
            with open(filename, 'a', encoding='utf-8') as f:
                f.write(f"\n// Auto-generated comment - {datetime.datetime.now()}\n")
        else:
            # 如果文件不存在，创建一个简单的文件
            with open(filename, 'w', encoding='utf-8') as f:
                if filename.endswith('.md'):
                    f.write(f"# {filename}\n\nThis is a sample file.\n")
                elif filename.endswith('.js') or filename.endswith('.ts'):
                    f.write(f"// {filename}\n\nconsole.log('Hello World');\n")
                elif filename.endswith('.json'):
                    f.write('{\n  "name": "sample",\n  "version": "1.0.0"\n}\n')
                else:
                    f.write(f"Sample content for {filename}\n")
        
        return filename

    def make_commit(self, date, message):
        """创建一个git commit"""
        try:
            # 创建虚拟更改
            changed_file = self.create_dummy_change()
            
            # 添加文件到git
            subprocess.run(['git', 'add', changed_file], check=True)
            
            # 设置commit日期环境变量
            env = os.environ.copy()
            date_str = date.strftime('%a %b %d %H:%M:%S %Y %z')
            env['GIT_AUTHOR_DATE'] = date_str
            env['GIT_COMMITTER_DATE'] = date_str
            
            # 创建commit
            subprocess.run(
                ['git', 'commit', '-m', message],
                env=env,
                check=True
            )
            
            print(f"✓ Created commit: {message} ({date_str})")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to create commit: {e}")
            return False

    def check_git_repo(self):
        """检查是否在git仓库中"""
        try:
            subprocess.run(['git', 'status'], 
                         capture_output=True, check=True)
            return True
        except subprocess.CalledProcessError:
            return False

    def initialize_git_repo(self):
        """初始化git仓库"""
        try:
            subprocess.run(['git', 'init'], check=True)
            subprocess.run(['git', 'config', 'user.name', 'Auto Committer'], check=True)
            subprocess.run(['git', 'config', 'user.email', 'auto@example.com'], check=True)
            print("✓ Initialized git repository")
            return True
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to initialize git repository: {e}")
            return False

    def generate_commits(self, num_commits=50):
        """生成指定数量的commits"""
        print(f"开始生成 {num_commits} 个随机commit记录...")
        print(f"时间范围: {self.start_date.strftime('%Y-%m-%d')} 到 {self.end_date.strftime('%Y-%m-%d')}")
        print("-" * 60)
        
        # 检查git仓库状态
        if not self.check_git_repo():
            print("当前目录不是git仓库，正在初始化...")
            if not self.initialize_git_repo():
                return False
        
        success_count = 0
        
        # 生成commits
        for i in range(num_commits):
            date = self.generate_random_date()
            message = self.get_random_commit_message()
            
            if self.make_commit(date, message):
                success_count += 1
            
            # 随机暂停，模拟真实的开发间隔
            if random.random() < 0.1:  # 10%的概率暂停
                import time
                time.sleep(0.1)
        
        print("-" * 60)
        print(f"✓ 成功生成 {success_count}/{num_commits} 个commit记录")
        
        if success_count > 0:
            print("\n可以使用以下命令查看commit历史:")
            print("git log --oneline --graph")
            print("git log --pretty=format:'%h - %an, %ar : %s'")
        
        return success_count > 0

def main():
    """主函数"""
    print("Git Commit 随机生成器")
    print("=" * 60)
    
    # 获取用户输入
    try:
        num_commits = input("请输入要生成的commit数量 (默认50): ")
        num_commits = int(num_commits) if num_commits.strip() else 50
        
        if num_commits <= 0:
            print("commit数量必须大于0")
            return
            
    except ValueError:
        print("请输入有效的数字")
        return
    
    # 创建生成器并执行
    generator = GitCommitGenerator()
    
    # 确认操作
    print(f"\n即将在当前目录生成 {num_commits} 个随机commit记录")
    print("时间范围: 2023年8月 - 2025年6月")
    
    confirm = input("\n确认继续? (y/N): ")
    if confirm.lower() not in ['y', 'yes']:
        print("操作已取消")
        return
    
    # 生成commits
    generator.generate_commits(num_commits)

if __name__ == "__main__":
    main()