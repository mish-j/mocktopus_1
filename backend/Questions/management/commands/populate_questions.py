from django.core.management.base import BaseCommand
from Questions.models import Category, Question

class Command(BaseCommand):
    help = 'Populate database with sample coding questions'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample questions...')
        
        # Create categories
        arrays_category, _ = Category.objects.get_or_create(name='Arrays')
        strings_category, _ = Category.objects.get_or_create(name='Strings')
        trees_category, _ = Category.objects.get_or_create(name='Trees')
        dp_category, _ = Category.objects.get_or_create(name='Dynamic Programming')
        
        # Sample questions
        sample_questions = [
            {
                'category': arrays_category,
                'title': 'Two Sum',
                'question_text': '''Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.''',
                'difficulty': 'easy',
                'examples': [
                    {
                        'input': 'nums = [2,7,11,15], target = 9',
                        'output': '[0,1]',
                        'explanation': 'Because nums[0] + nums[1] == 9, we return [0, 1].'
                    },
                    {
                        'input': 'nums = [3,2,4], target = 6',
                        'output': '[1,2]',
                        'explanation': 'Because nums[1] + nums[2] == 6, we return [1, 2].'
                    }
                ],
                'constraints': '''- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.''',
                'hints': 'Try using a hash map to store the numbers you have seen so far.'
            },
            {
                'category': arrays_category,
                'title': 'Maximum Subarray',
                'question_text': '''Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.''',
                'difficulty': 'medium',
                'examples': [
                    {
                        'input': 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
                        'output': '6',
                        'explanation': '[4,-1,2,1] has the largest sum = 6.'
                    },
                    {
                        'input': 'nums = [1]',
                        'output': '1',
                        'explanation': 'The subarray [1] has the largest sum = 1.'
                    }
                ],
                'constraints': '''- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4''',
                'hints': 'Think about Kadane\'s algorithm for this problem.'
            },
            {
                'category': strings_category,
                'title': 'Valid Parentheses',
                'question_text': '''Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.''',
                'difficulty': 'easy',
                'examples': [
                    {
                        'input': 's = "()"',
                        'output': 'true',
                        'explanation': 'The string contains valid parentheses.'
                    },
                    {
                        'input': 's = "()[]{}"',
                        'output': 'true',
                        'explanation': 'All brackets are properly closed.'
                    },
                    {
                        'input': 's = "(]"',
                        'output': 'false',
                        'explanation': 'Mismatched bracket types.'
                    }
                ],
                'constraints': '''- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.''',
                'hints': 'Use a stack data structure to keep track of opening brackets.'
            },
            {
                'category': trees_category,
                'title': 'Binary Tree Inorder Traversal',
                'question_text': '''Given the root of a binary tree, return the inorder traversal of its nodes' values.

Inorder traversal visits nodes in the order: left subtree, root, right subtree.''',
                'difficulty': 'easy',
                'examples': [
                    {
                        'input': 'root = [1,null,2,3]',
                        'output': '[1,3,2]',
                        'explanation': 'Inorder traversal: left -> root -> right'
                    },
                    {
                        'input': 'root = []',
                        'output': '[]',
                        'explanation': 'Empty tree returns empty array.'
                    }
                ],
                'constraints': '''- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100''',
                'hints': 'Can you solve this both recursively and iteratively?'
            },
            {
                'category': dp_category,
                'title': 'Climbing Stairs',
                'question_text': '''You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?''',
                'difficulty': 'easy',
                'examples': [
                    {
                        'input': 'n = 2',
                        'output': '2',
                        'explanation': 'There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps'
                    },
                    {
                        'input': 'n = 3',
                        'output': '3',
                        'explanation': 'There are three ways: 1. 1 + 1 + 1, 2. 1 + 2, 3. 2 + 1'
                    }
                ],
                'constraints': '''- 1 <= n <= 45''',
                'hints': 'This is essentially a Fibonacci sequence problem.'
            },
            {
                'category': arrays_category,
                'title': 'Best Time to Buy and Sell Stock',
                'question_text': '''You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.''',
                'difficulty': 'easy',
                'examples': [
                    {
                        'input': 'prices = [7,1,5,3,6,4]',
                        'output': '5',
                        'explanation': 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
                    },
                    {
                        'input': 'prices = [7,6,4,3,1]',
                        'output': '0',
                        'explanation': 'In this case, no transactions are done and the max profit = 0.'
                    }
                ],
                'constraints': '''- 1 <= prices.length <= 10^5
- 0 <= prices[i] <= 10^4''',
                'hints': 'Keep track of the minimum price seen so far and maximum profit.'
            }
        ]
        
        # Create questions
        created_count = 0
        for question_data in sample_questions:
            question, created = Question.objects.get_or_create(
                title=question_data['title'],
                defaults=question_data
            )
            if created:
                created_count += 1
                self.stdout.write(f'Created question: {question.title}')
            else:
                self.stdout.write(f'Question already exists: {question.title}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} new questions. Total questions: {Question.objects.count()}'
            )
        )
