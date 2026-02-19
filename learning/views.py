from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Word, Sentence, Grammar, StudyLog, StudyGoal
from .serializers import (
    WordSerializer, WordListSerializer,
    SentenceSerializer, SentenceListSerializer,
    GrammarSerializer, GrammarListSerializer,
    StudyLogSerializer, StudyGoalSerializer,
    DashboardSerializer, ReviewItemSerializer
)


class WordViewSet(viewsets.ModelViewSet):
    """单词 API"""
    queryset = Word.objects.all()
    serializer_class = WordSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WordListSerializer
        return WordSerializer
    
    def get_queryset(self):
        queryset = Word.objects.all()
        
        # 搜索
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(word__icontains=search) | 
                Q(meaning__icontains=search)
            )
        
        # 难度筛选
        difficulty = self.request.query_params.get('difficulty', '')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # 收藏筛选
        is_favorite = self.request.query_params.get('is_favorite', '')
        if is_favorite:
            queryset = queryset.filter(is_favorite=is_favorite.lower() == 'true')
        
        # 分类筛选
        category = self.request.query_params.get('category', '')
        if category:
            queryset = queryset.filter(category__icontains=category)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """记录复习"""
        word = self.get_object()
        word.review()
        StudyLog.objects.create(
            log_type='word',
            reference_id=word.id,
            action='复习单词',
            notes=f'复习了单词: {word.word}'
        )
        return Response({'status': 'success', 'review_count': word.review_count})
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """切换收藏状态"""
        word = self.get_object()
        word.is_favorite = not word.is_favorite
        word.save()
        return Response({'status': 'success', 'is_favorite': word.is_favorite})
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """获取所有分类"""
        categories = Word.objects.exclude(category='').values_list('category', flat=True).distinct()
        return Response(list(categories))
    
    @action(detail=False, methods=['get'])
    def random(self, request):
        """随机获取单词"""
        import random
        count = int(request.query_params.get('count', 1))
        word_ids = list(Word.objects.values_list('id', flat=True))
        if word_ids:
            selected_ids = random.sample(word_ids, min(count, len(word_ids)))
            words = Word.objects.filter(id__in=selected_ids)
            serializer = WordSerializer(words, many=True)
            return Response(serializer.data)
        return Response([])


class SentenceViewSet(viewsets.ModelViewSet):
    """句子 API"""
    queryset = Sentence.objects.all()
    serializer_class = SentenceSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SentenceListSerializer
        return SentenceSerializer
    
    def get_queryset(self):
        queryset = Sentence.objects.all()
        
        # 搜索
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(english__icontains=search) | 
                Q(chinese__icontains=search)
            )
        
        # 类型筛选
        sentence_type = self.request.query_params.get('type', '')
        if sentence_type:
            queryset = queryset.filter(sentence_type=sentence_type)
        
        # 收藏筛选
        is_favorite = self.request.query_params.get('is_favorite', '')
        if is_favorite:
            queryset = queryset.filter(is_favorite=is_favorite.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """记录复习"""
        sentence = self.get_object()
        sentence.review()
        StudyLog.objects.create(
            log_type='sentence',
            reference_id=sentence.id,
            action='复习句子',
            notes=f'复习了句子: {sentence.english[:30]}...'
        )
        return Response({'status': 'success', 'review_count': sentence.review_count})
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """切换收藏状态"""
        sentence = self.get_object()
        sentence.is_favorite = not sentence.is_favorite
        sentence.save()
        return Response({'status': 'success', 'is_favorite': sentence.is_favorite})
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """获取所有句子类型"""
        return Response([{'value': t[0], 'label': t[1]} for t in Sentence.SENTENCE_TYPES])
    
    @action(detail=False, methods=['get'])
    def random(self, request):
        """随机获取句子"""
        import random
        count = int(request.query_params.get('count', 1))
        sentence_ids = list(Sentence.objects.values_list('id', flat=True))
        if sentence_ids:
            selected_ids = random.sample(sentence_ids, min(count, len(sentence_ids)))
            sentences = Sentence.objects.filter(id__in=selected_ids)
            serializer = SentenceSerializer(sentences, many=True)
            return Response(serializer.data)
        return Response([])


class GrammarViewSet(viewsets.ModelViewSet):
    """语法 API"""
    queryset = Grammar.objects.all()
    serializer_class = GrammarSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return GrammarListSerializer
        return GrammarSerializer
    
    def get_queryset(self):
        queryset = Grammar.objects.all()
        
        # 搜索
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(structure__icontains=search) |
                Q(explanation__icontains=search)
            )
        
        # 难度筛选
        difficulty = self.request.query_params.get('difficulty', '')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # 分类筛选
        category = self.request.query_params.get('category', '')
        if category:
            queryset = queryset.filter(category__icontains=category)
        
        # 掌握状态筛选
        is_mastered = self.request.query_params.get('is_mastered', '')
        if is_mastered:
            queryset = queryset.filter(is_mastered=is_mastered.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """记录复习"""
        grammar = self.get_object()
        grammar.review()
        StudyLog.objects.create(
            log_type='grammar',
            reference_id=grammar.id,
            action='复习语法',
            notes=f'复习了语法: {grammar.title}'
        )
        return Response({'status': 'success', 'review_count': grammar.review_count})
    
    @action(detail=True, methods=['post'])
    def toggle_mastered(self, request, pk=None):
        """切换掌握状态"""
        grammar = self.get_object()
        grammar.is_mastered = not grammar.is_mastered
        grammar.save()
        return Response({'status': 'success', 'is_mastered': grammar.is_mastered})
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """获取所有分类"""
        categories = Grammar.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))


class StudyLogViewSet(viewsets.ReadOnlyModelViewSet):
    """学习记录 API（只读）"""
    queryset = StudyLog.objects.all()
    serializer_class = StudyLogSerializer
    
    def get_queryset(self):
        queryset = StudyLog.objects.all()
        
        # 类型筛选
        log_type = self.request.query_params.get('type', '')
        if log_type:
            queryset = queryset.filter(log_type=log_type)
        
        # 日期筛选
        date_from = self.request.query_params.get('from', '')
        date_to = self.request.query_params.get('to', '')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset


class StudyGoalViewSet(viewsets.ModelViewSet):
    """学习目标 API"""
    queryset = StudyGoal.objects.all()
    serializer_class = StudyGoalSerializer


class DashboardView(APIView):
    """仪表盘视图"""
    
    def get(self, request):
        today = timezone.now().date()
        
        # 统计数据
        total_words = Word.objects.count()
        total_sentences = Sentence.objects.count()
        total_grammar = Grammar.objects.count()
        
        today_words = Word.objects.filter(created_at__date=today).count()
        today_sentences = Sentence.objects.filter(created_at__date=today).count()
        today_grammar = Grammar.objects.filter(created_at__date=today).count()
        
        favorite_words = Word.objects.filter(is_favorite=True).count()
        favorite_sentences = Sentence.objects.filter(is_favorite=True).count()
        mastered_grammar = Grammar.objects.filter(is_mastered=True).count()
        
        # 最近活动
        recent_activities = StudyLog.objects.select_related()[:10]
        activities_data = []
        for activity in recent_activities:
            activities_data.append({
                'type': activity.log_type,
                'action': activity.action,
                'time': activity.created_at.strftime('%Y-%m-%d %H:%M')
            })
        
        # 计算连续学习天数
        study_streak = self._calculate_streak()
        
        data = {
            'total_words': total_words,
            'total_sentences': total_sentences,
            'total_grammar': total_grammar,
            'today_words': today_words,
            'today_sentences': today_sentences,
            'today_grammar': today_grammar,
            'favorite_words': favorite_words,
            'favorite_sentences': favorite_sentences,
            'mastered_grammar': mastered_grammar,
            'recent_activities': activities_data,
            'study_streak': study_streak
        }
        
        return Response(data)
    
    def _calculate_streak(self):
        """计算连续学习天数"""
        today = timezone.now().date()
        streak = 0
        
        for i in range(365):  # 最多查一年
            check_date = today - timedelta(days=i)
            has_activity = StudyLog.objects.filter(created_at__date=check_date).exists()
            
            if has_activity:
                streak += 1
            else:
                break
        
        return streak


class StatisticsView(APIView):
    """统计数据视图"""
    
    def get(self, request):
        # 按难度统计单词
        word_by_difficulty = Word.objects.values('difficulty').annotate(count=Count('id'))
        
        # 按类型统计句子
        sentence_by_type = Sentence.objects.values('sentence_type').annotate(count=Count('id'))
        
        # 按难度统计语法
        grammar_by_difficulty = Grammar.objects.values('difficulty').annotate(count=Count('id'))
        
        # 最近7天的学习记录
        last_7_days = []
        today = timezone.now().date()
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            word_count = Word.objects.filter(created_at__date=date).count()
            sentence_count = Sentence.objects.filter(created_at__date=date).count()
            grammar_count = Grammar.objects.filter(created_at__date=date).count()
            
            last_7_days.append({
                'date': date.strftime('%m-%d'),
                'words': word_count,
                'sentences': sentence_count,
                'grammar': grammar_count
            })
        
        return Response({
            'word_by_difficulty': list(word_by_difficulty),
            'sentence_by_type': list(sentence_by_type),
            'grammar_by_difficulty': list(grammar_by_difficulty),
            'last_7_days': last_7_days
        })


class ReviewListView(APIView):
    """复习列表视图"""
    
    def get(self, request):
        items = []
        
        # 获取需要复习的单词（7天未复习或复习次数<5）
        seven_days_ago = timezone.now() - timedelta(days=7)
        words_to_review = Word.objects.filter(
            Q(last_reviewed__isnull=True) | 
            Q(last_reviewed__lt=seven_days_ago) |
            Q(review_count__lt=5)
        )[:20]
        
        for word in words_to_review:
            items.append({
                'id': word.id,
                'type': 'word',
                'title': word.word,
                'content': word.meaning,
                'last_reviewed': word.last_reviewed,
                'review_count': word.review_count
            })
        
        # 获取需要复习的句子
        sentences_to_review = Sentence.objects.filter(
            Q(last_reviewed__isnull=True) | 
            Q(last_reviewed__lt=seven_days_ago) |
            Q(review_count__lt=3)
        )[:20]
        
        for sentence in sentences_to_review:
            items.append({
                'id': sentence.id,
                'type': 'sentence',
                'title': sentence.english[:50],
                'content': sentence.chinese,
                'last_reviewed': sentence.last_reviewed,
                'review_count': sentence.review_count
            })
        
        # 获取需要复习的语法（未掌握或10天未复习）
        ten_days_ago = timezone.now() - timedelta(days=10)
        grammar_to_review = Grammar.objects.filter(
            Q(is_mastered=False) |
            Q(last_reviewed__isnull=True) | 
            Q(last_reviewed__lt=ten_days_ago)
        )[:20]
        
        for grammar in grammar_to_review:
            items.append({
                'id': grammar.id,
                'type': 'grammar',
                'title': grammar.title,
                'content': grammar.structure,
                'last_reviewed': grammar.last_reviewed,
                'review_count': grammar.review_count
            })
        
        # 按最后复习时间排序
        items.sort(key=lambda x: x['last_reviewed'] or timezone.datetime.min.replace(tzinfo=timezone.get_current_timezone()))
        
        return Response(items[:50])


class SearchView(APIView):
    """搜索视图"""
    
    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'words': [], 'sentences': [], 'grammar': []})
        
        # 搜索单词
        words = Word.objects.filter(
            Q(word__icontains=query) | Q(meaning__icontains=query)
        )[:10]
        
        # 搜索句子
        sentences = Sentence.objects.filter(
            Q(english__icontains=query) | Q(chinese__icontains=query)
        )[:10]
        
        # 搜索语法
        grammar_items = Grammar.objects.filter(
            Q(title__icontains=query) | Q(structure__icontains=query) | Q(explanation__icontains=query)
        )[:10]
        
        return Response({
            'words': WordListSerializer(words, many=True).data,
            'sentences': SentenceListSerializer(sentences, many=True).data,
            'grammar': GrammarListSerializer(grammar_items, many=True).data
        })


class WordBulkDeleteView(APIView):
    """批量删除单词"""
    
    def post(self, request):
        ids = request.data.get('ids', [])
        if ids:
            Word.objects.filter(id__in=ids).delete()
            return Response({'status': 'success', 'deleted': len(ids)})
        return Response({'status': 'error', 'message': 'No IDs provided'}, status=400)


class SentenceBulkDeleteView(APIView):
    """批量删除句子"""
    
    def post(self, request):
        ids = request.data.get('ids', [])
        if ids:
            Sentence.objects.filter(id__in=ids).delete()
            return Response({'status': 'success', 'deleted': len(ids)})
        return Response({'status': 'error', 'message': 'No IDs provided'}, status=400)


class GrammarBulkDeleteView(APIView):
    """批量删除语法"""
    
    def post(self, request):
        ids = request.data.get('ids', [])
        if ids:
            Grammar.objects.filter(id__in=ids).delete()
            return Response({'status': 'success', 'deleted': len(ids)})
        return Response({'status': 'error', 'message': 'No IDs provided'}, status=400)
