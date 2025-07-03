from django.core.management.base import BaseCommand
from Questions.models import Category, Question

class Command(BaseCommand):
    help = 'Populate the database with sample questions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting to populate questions database...'))
        
        # Create categories
        categories_data = [
            'Software-Engineering',
            'Data-Science', 
            'System-Design'
        ]
        
        for cat_name in categories_data:
            category, created = Category.objects.get_or_create(name=cat_name)
            if created:
                self.stdout.write(f'✅ Created category: {cat_name}')
            else:
                self.stdout.write(f'📁 Category already exists: {cat_name}')

        # Sample questions data
        questions_data = [
            # Software Engineering Questions
            {
                'category': 'Software-Engineering',
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
                'constraints': '''• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists.''',
                'hints': '''• Try using a hash map to store the complement values
• For each number, check if its complement (target - current) exists in the hash map'''
            },
            {
                'category': 'Software-Engineering',
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
                        'explanation': 'All brackets are properly matched.'
                    },
                    {
                        'input': 's = "(]"',
                        'output': 'false',
                        'explanation': 'Mismatched bracket types.'
                    }
                ],
                'constraints': '''• 1 <= s.length <= 10^4
• s consists of parentheses only '()[]{}'.''',
                'hints': '''• Use a stack data structure
• Push opening brackets onto the stack
• When encountering a closing bracket, check if it matches the top of the stack'''
            },
            {
                'category': 'Software-Engineering',
                'title': 'Merge Two Sorted Lists',
                'question_text': '''You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.''',
                'difficulty': 'easy',
                'examples': [
                    {
                        'input': 'list1 = [1,2,4], list2 = [1,3,4]',
                        'output': '[1,1,2,3,4,4]',
                        'explanation': 'The merged list maintains sorted order.'
                    },
                    {
                        'input': 'list1 = [], list2 = []',
                        'output': '[]',
                        'explanation': 'Both lists are empty.'
                    }
                ],
                'constraints': '''• The number of nodes in both lists is in the range [0, 50].
• -100 <= Node.val <= 100
• Both list1 and list2 are sorted in non-decreasing order.''',
                'hints': '''• Use two pointers to traverse both lists
• Compare values and link the smaller node to the result
• Handle remaining nodes when one list is exhausted'''
            },
            {
                'category': 'Software-Engineering',
                'title': 'Maximum Subarray',
                'question_text': '''Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.''',
                'difficulty': 'medium',
                'examples': [
                    {
                        'input': 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
                        'output': '6',
                        'explanation': 'The subarray [4,-1,2,1] has the largest sum = 6.'
                    },
                    {
                        'input': 'nums = [1]',
                        'output': '1',
                        'explanation': 'The subarray [1] has the largest sum = 1.'
                    }
                ],
                'constraints': '''• 1 <= nums.length <= 10^5
• -10^4 <= nums[i] <= 10^4''',
                'hints': '''• Consider using Kadane's algorithm
• Keep track of the maximum sum ending at current position
• Update global maximum when needed'''
            },
            {
                'category': 'Software-Engineering',
                'title': 'Binary Tree Inorder Traversal',
                'question_text': '''Given the root of a binary tree, return the inorder traversal of its nodes' values.

Inorder traversal visits nodes in the order: left subtree, root, right subtree.''',
                'difficulty': 'easy',
                'examples': [
                    {
                        'input': 'root = [1,null,2,3]',
                        'output': '[1,3,2]',
                        'explanation': 'Inorder traversal: left, root, right.'
                    },
                    {
                        'input': 'root = []',
                        'output': '[]',
                        'explanation': 'Empty tree.'
                    }
                ],
                'constraints': '''• The number of nodes in the tree is in the range [0, 100].
• -100 <= Node.val <= 100''',
                'hints': '''• Can be solved recursively or iteratively
• For iterative solution, use a stack
• Process left subtree, then root, then right subtree'''
            },

            # Data Science Questions
            {
                'category': 'Data-Science',
                'title': 'Data Preprocessing Pipeline',
                'question_text': '''Design a data preprocessing pipeline for a machine learning project that handles missing values, outliers, and feature scaling.

Your pipeline should:
1. Handle missing numerical and categorical data
2. Detect and handle outliers
3. Perform feature scaling
4. Encode categorical variables

Explain your approach and provide code examples.''',
                'difficulty': 'medium',
                'examples': [
                    {
                        'input': 'Dataset with missing values, outliers, and mixed data types',
                        'output': 'Clean, scaled dataset ready for ML model training',
                        'explanation': 'Complete preprocessing pipeline transforms raw data into model-ready format.'
                    }
                ],
                'constraints': '''• Handle both numerical and categorical features
• Consider different scaling methods
• Preserve data integrity while cleaning''',
                'hints': '''• Use pandas for data manipulation
• Consider sklearn's preprocessing modules
• Implement proper train/validation/test split handling
• Use appropriate imputation strategies for different data types'''
            },
            {
                'category': 'Data-Science',
                'title': 'Feature Selection Techniques',
                'question_text': '''Explain and implement different feature selection techniques for a high-dimensional dataset.

Compare the following methods:
1. Filter methods (correlation, mutual information)
2. Wrapper methods (forward/backward selection)
3. Embedded methods (Lasso, tree-based importance)

When would you use each approach?''',
                'difficulty': 'medium',
                'examples': [
                    {
                        'input': 'Dataset with 1000+ features and target variable',
                        'output': 'Reduced feature set with maintained or improved model performance',
                        'explanation': 'Different techniques identify most relevant features for the task.'
                    }
                ],
                'constraints': '''• Handle both regression and classification tasks
• Consider computational efficiency
• Maintain model interpretability''',
                'hints': '''• Use sklearn.feature_selection module
• Consider correlation matrices for filter methods
• Implement cross-validation for wrapper methods
• Use regularization coefficients for embedded methods'''
            },
            {
                'category': 'Data-Science',
                'title': 'A/B Testing Analysis',
                'question_text': '''Design and analyze an A/B test to determine if a new website feature increases user conversion rates.

Your analysis should include:
1. Experimental design (sample size, randomization)
2. Statistical hypothesis testing
3. Confidence intervals
4. Practical significance vs statistical significance
5. Potential confounding factors

Provide code for the statistical analysis.''',
                'difficulty': 'hard',
                'examples': [
                    {
                        'input': 'Conversion data from control and treatment groups',
                        'output': 'Statistical conclusion about feature effectiveness with confidence intervals',
                        'explanation': 'Complete A/B test analysis with actionable business insights.'
                    }
                ],
                'constraints': '''• Account for multiple testing if applicable
• Consider minimum detectable effect size
• Handle imbalanced group sizes''',
                'hints': '''• Use scipy.stats for hypothesis testing
• Calculate power analysis for sample size
• Consider bootstrapping for confidence intervals
• Check assumptions for chosen statistical tests'''
            },
            {
                'category': 'Data-Science',
                'title': 'Time Series Forecasting',
                'question_text': '''Build a time series forecasting model to predict monthly sales for the next 12 months.

Your solution should:
1. Analyze time series components (trend, seasonality, noise)
2. Handle missing values and outliers
3. Compare different forecasting methods (ARIMA, Prophet, LSTM)
4. Provide prediction intervals
5. Evaluate model performance

Include data visualization and model interpretation.''',
                'difficulty': 'hard',
                'examples': [
                    {
                        'input': 'Historical monthly sales data with seasonal patterns',
                        'output': '12-month sales forecast with confidence intervals',
                        'explanation': 'Comprehensive time series analysis with multiple model comparison.'
                    }
                ],
                'constraints': '''• Handle irregular data patterns
• Account for external factors (holidays, events)
• Provide uncertainty quantification''',
                'hints': '''• Use statsmodels for ARIMA
• Consider Facebook Prophet for seasonality
• Use tensorflow/keras for LSTM models
• Implement proper time series cross-validation'''
            },
            {
                'category': 'Data-Science',
                'title': 'Recommendation System',
                'question_text': '''Design a recommendation system for an e-commerce platform that suggests products to users.

Implement and compare:
1. Collaborative filtering (user-based and item-based)
2. Content-based filtering
3. Matrix factorization techniques
4. Hybrid approaches

Address the cold start problem and scalability concerns.''',
                'difficulty': 'hard',
                'examples': [
                    {
                        'input': 'User-item interaction matrix and product features',
                        'output': 'Personalized product recommendations for each user',
                        'explanation': 'Multi-approach recommendation system with performance evaluation.'
                    }
                ],
                'constraints': '''• Handle sparse user-item matrices
• Scale to millions of users and products
• Provide real-time recommendations''',
                'hints': '''• Use surprise library for collaborative filtering
• Implement cosine similarity for content-based filtering
• Consider NMF or SVD for matrix factorization
• Use ensemble methods for hybrid approaches'''
            },

            # System Design Questions
            {
                'category': 'System-Design',
                'title': 'Design a URL Shortener',
                'question_text': '''Design a URL shortening service like bit.ly or tinyurl.

Requirements:
1. Shorten long URLs to 6-8 character strings
2. Redirect short URLs to original URLs
3. Handle 100M URLs per day
4. Analytics on URL clicks
5. Custom aliases (optional)
6. URL expiration (optional)

Consider scalability, reliability, and performance.''',
                'difficulty': 'medium',
                'examples': [
                    {
                        'input': 'Long URL: https://www.example.com/very/long/path',
                        'output': 'Short URL: https://short.ly/abc123',
                        'explanation': 'Service generates unique short URL that redirects to original.'
                    }
                ],
                'constraints': '''• 100:1 read to write ratio
• 99.9% availability required
• Low latency for redirects
• Handle peak traffic''',
                'hints': '''• Consider base62 encoding for short URLs
• Use caching for popular URLs
• Database sharding for scalability
• CDN for global distribution'''
            },
            {
                'category': 'System-Design',
                'title': 'Design a Chat System',
                'question_text': '''Design a real-time chat system like WhatsApp or Slack.

Features to support:
1. 1-on-1 and group messaging
2. Message delivery confirmation
3. Online/offline status
4. Push notifications
5. Message history
6. File sharing
7. End-to-end encryption (optional)

Scale to 1 billion users with millions of concurrent connections.''',
                'difficulty': 'hard',
                'examples': [
                    {
                        'input': 'User sends message in group chat',
                        'output': 'Real-time delivery to all online group members with delivery confirmation',
                        'explanation': 'System handles real-time messaging with reliability guarantees.'
                    }
                ],
                'constraints': '''• Sub-second message delivery
• Handle network failures gracefully
• Store message history efficiently
• Support multimedia messages''',
                'hints': '''• Use WebSockets for real-time communication
• Message queues for reliable delivery
• Consistent hashing for user distribution
• Consider Apache Kafka for message streaming'''
            },
            {
                'category': 'System-Design',
                'title': 'Design a Social Media Feed',
                'question_text': '''Design the news feed system for a social media platform like Facebook or Twitter.

Requirements:
1. Users can post updates (text, images, videos)
2. News feed shows relevant posts from friends/followees
3. Support likes, comments, shares
4. Real-time updates
5. Personalized ranking algorithm
6. Handle viral content

Scale to 1 billion users with varying activity levels.''',
                'difficulty': 'hard',
                'examples': [
                    {
                        'input': 'User opens mobile app',
                        'output': 'Personalized news feed with latest relevant posts',
                        'explanation': 'System generates and serves personalized content feed efficiently.'
                    }
                ],
                'constraints': '''• Sub-second feed generation
• Handle celebrity users with millions of followers
• Personalized ranking based on user behavior
• Support various content types''',
                'hints': '''• Fan-out strategies (push vs pull vs hybrid)
• Caching layers for hot content
• Machine learning for feed ranking
• CDN for media content delivery'''
            },
            {
                'category': 'System-Design',
                'title': 'Design a Distributed Cache',
                'question_text': '''Design a distributed caching system like Redis or Memcached.

Features:
1. Key-value storage with TTL
2. LRU eviction policy
3. Consistent hashing for distribution
4. Replication for fault tolerance
5. Monitoring and metrics
6. Support for different data types

Handle cache misses, hot keys, and node failures gracefully.''',
                'difficulty': 'hard',
                'examples': [
                    {
                        'input': 'Application requests cached data with key "user:123"',
                        'output': 'Cache returns stored value or indicates cache miss',
                        'explanation': 'Distributed cache provides fast access to frequently requested data.'
                    }
                ],
                'constraints': '''• Microsecond response times
• 99.99% availability
• Handle millions of requests per second
• Automatic failover''',
                'hints': '''• Consistent hashing for key distribution
• Master-slave replication for reliability
• Bloom filters to reduce cache misses
• Monitoring for cache hit ratios'''
            },
            {
                'category': 'System-Design',
                'title': 'Design a Video Streaming Service',
                'question_text': '''Design a video streaming service like Netflix or YouTube.

Requirements:
1. Video upload and processing
2. Multiple video quality options
3. Global content delivery
4. Recommendation system
5. User profiles and watch history
6. Live streaming support (optional)
7. Monetization features

Scale to serve billions of hours of video monthly.''',
                'difficulty': 'hard',
                'examples': [
                    {
                        'input': 'User searches for and plays a video',
                        'output': 'High-quality video stream with minimal buffering',
                        'explanation': 'System efficiently delivers video content globally with optimal quality.'
                    }
                ],
                'constraints': '''• Support 4K and HDR content
• Global distribution with low latency
• Handle peak viewing hours
• Adaptive bitrate streaming''',
                'hints': '''• CDN for global content distribution
• Video transcoding for multiple formats
• Recommendation ML models
• Microservices architecture for scalability'''
            }
        ]

        # Create questions
        total_created = 0
        for q_data in questions_data:
            category = Category.objects.get(name=q_data['category'])
            
            question, created = Question.objects.get_or_create(
                title=q_data['title'],
                category=category,
                defaults={
                    'question_text': q_data['question_text'],
                    'difficulty': q_data['difficulty'],
                    'examples': q_data['examples'],
                    'constraints': q_data['constraints'],
                    'hints': q_data['hints']
                }
            )
            
            if created:
                total_created += 1
                self.stdout.write(f'✅ Created question: {q_data["title"]} ({q_data["difficulty"]})')
            else:
                self.stdout.write(f'📝 Question already exists: {q_data["title"]}')

        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Database population completed!')
        )
        self.stdout.write(
            self.style.SUCCESS(f'📊 Total questions created: {total_created}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'📁 Categories: {len(categories_data)}')
        )
        
        # Show summary
        for cat_name in categories_data:
            count = Question.objects.filter(category__name=cat_name).count()
            self.stdout.write(f'  • {cat_name}: {count} questions')
