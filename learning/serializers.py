from rest_framework import serializers
from .models import Word, Sentence, Grammar, StudyLog, StudyGoal


class WordSerializer(serializers.ModelSerializer):
    """单词序列化器"""
    class Meta:
        model = Word
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'review_count']


class WordListSerializer(serializers.ModelSerializer):
    """单词列表序列化器（简化版）"""
    class Meta:
        model = Word
        fields = ['id', 'word', 'meaning', 'part_of_speech', 'difficulty', 'is_favorite', 'review_count']


class SentenceSerializer(serializers.ModelSerializer):
    """句子序列化器"""
    sentence_type_display = serializers.CharField(source='get_sentence_type_display', read_only=True)
    
    class Meta:
        model = Sentence
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'review_count']


class SentenceListSerializer(serializers.ModelSerializer):
    """句子列表序列化器（简化版）"""
    class Meta:
        model = Sentence
        fields = ['id', 'english', 'chinese', 'sentence_type', 'is_favorite', 'review_count']


class GrammarSerializer(serializers.ModelSerializer):
    """语法序列化器"""
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    
    class Meta:
        model = Grammar
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'review_count']


class GrammarListSerializer(serializers.ModelSerializer):
    """语法列表序列化器（简化版）"""
    class Meta:
        model = Grammar
        fields = ['id', 'title', 'structure', 'difficulty', 'category', 'is_mastered']


class StudyLogSerializer(serializers.ModelSerializer):
    """学习记录序列化器"""
    log_type_display = serializers.CharField(source='get_log_type_display', read_only=True)
    
    class Meta:
        model = StudyLog
        fields = '__all__'
        read_only_fields = ['created_at']


class StudyGoalSerializer(serializers.ModelSerializer):
    """学习目标序列化器"""
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyGoal
        fields = '__all__'
    
    def get_progress(self, obj):
        """计算学习进度"""
        from django.utils import timezone
        
        if not obj.is_active:
            return None
        
        total_days = (obj.end_date - obj.start_date).days
        passed_days = (timezone.now().date() - obj.start_date).days
        
        if total_days <= 0:
            return 100
        
        progress = min(100, max(0, (passed_days / total_days) * 100))
        return round(progress, 1)


class DashboardSerializer(serializers.Serializer):
    """仪表盘数据序列化器"""
    total_words = serializers.IntegerField()
    total_sentences = serializers.IntegerField()
    total_grammar = serializers.IntegerField()
    today_words = serializers.IntegerField()
    today_sentences = serializers.IntegerField()
    today_grammar = serializers.IntegerField()
    favorite_words = serializers.IntegerField()
    favorite_sentences = serializers.IntegerField()
    mastered_grammar = serializers.IntegerField()
    recent_activities = serializers.ListField()
    study_streak = serializers.IntegerField()


class ReviewItemSerializer(serializers.Serializer):
    """复习项目序列化器"""
    id = serializers.IntegerField()
    type = serializers.CharField()
    title = serializers.CharField()
    content = serializers.CharField()
    last_reviewed = serializers.DateTimeField()
    review_count = serializers.IntegerField()
