from django.db import models
from django.utils import timezone


class Word(models.Model):
    """单词模型"""
    DIFFICULTY_CHOICES = [
        ('easy', '简单'),
        ('medium', '中等'),
        ('hard', '困难'),
    ]
    
    word = models.CharField(max_length=100, verbose_name='单词')
    phonetic = models.CharField(max_length=100, blank=True, verbose_name='音标')
    meaning = models.TextField(verbose_name='中文释义')
    part_of_speech = models.CharField(max_length=50, blank=True, verbose_name='词性')
    example_sentence = models.TextField(blank=True, verbose_name='例句')
    example_translation = models.TextField(blank=True, verbose_name='例句翻译')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium', verbose_name='难度')
    category = models.CharField(max_length=100, blank=True, verbose_name='分类')
    notes = models.TextField(blank=True, verbose_name='备注')
    review_count = models.IntegerField(default=0, verbose_name='复习次数')
    last_reviewed = models.DateTimeField(null=True, blank=True, verbose_name='最后复习时间')
    is_favorite = models.BooleanField(default=False, verbose_name='收藏')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        verbose_name = '单词'
        verbose_name_plural = '单词'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.word
    
    def review(self):
        """记录复习"""
        self.review_count += 1
        self.last_reviewed = timezone.now()
        self.save()


class Sentence(models.Model):
    """句子/翻译模型"""
    SENTENCE_TYPES = [
        ('translation', '翻译练习'),
        ('daily', '日常用语'),
        ('business', '商务英语'),
        ('academic', '学术英语'),
        ('slang', '俚语'),
        ('quote', '名言'),
    ]
    
    english = models.TextField(verbose_name='英文句子')
    chinese = models.TextField(verbose_name='中文翻译')
    sentence_type = models.CharField(max_length=20, choices=SENTENCE_TYPES, default='daily', verbose_name='类型')
    keywords = models.CharField(max_length=200, blank=True, verbose_name='关键词')
    grammar_points = models.TextField(blank=True, verbose_name='语法要点')
    notes = models.TextField(blank=True, verbose_name='备注')
    is_favorite = models.BooleanField(default=False, verbose_name='收藏')
    review_count = models.IntegerField(default=0, verbose_name='复习次数')
    last_reviewed = models.DateTimeField(null=True, blank=True, verbose_name='最后复习时间')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        verbose_name = '句子'
        verbose_name_plural = '句子'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.english[:50]
    
    def review(self):
        """记录复习"""
        self.review_count += 1
        self.last_reviewed = timezone.now()
        self.save()


class Grammar(models.Model):
    """语法结构模型"""
    DIFFICULTY_CHOICES = [
        ('beginner', '初级'),
        ('intermediate', '中级'),
        ('advanced', '高级'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='语法标题')
    structure = models.TextField(verbose_name='语法结构')
    explanation = models.TextField(verbose_name='详细解释')
    usage = models.TextField(verbose_name='用法说明')
    examples = models.JSONField(default=list, verbose_name='例句列表')
    difficulty = models.CharField(max_length=15, choices=DIFFICULTY_CHOICES, default='intermediate', verbose_name='难度')
    category = models.CharField(max_length=100, verbose_name='语法分类')
    common_mistakes = models.TextField(blank=True, verbose_name='常见错误')
    tips = models.TextField(blank=True, verbose_name='学习技巧')
    is_mastered = models.BooleanField(default=False, verbose_name='已掌握')
    review_count = models.IntegerField(default=0, verbose_name='复习次数')
    last_reviewed = models.DateTimeField(null=True, blank=True, verbose_name='最后复习时间')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        verbose_name = '语法'
        verbose_name_plural = '语法'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def review(self):
        """记录复习"""
        self.review_count += 1
        self.last_reviewed = timezone.now()
        self.save()


class StudyLog(models.Model):
    """学习记录"""
    LOG_TYPES = [
        ('word', '单词'),
        ('sentence', '句子'),
        ('grammar', '语法'),
    ]
    
    log_type = models.CharField(max_length=10, choices=LOG_TYPES, verbose_name='学习类型')
    reference_id = models.IntegerField(verbose_name='关联ID')
    action = models.CharField(max_length=50, verbose_name='操作')
    notes = models.TextField(blank=True, verbose_name='备注')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='学习时间')
    
    class Meta:
        verbose_name = '学习记录'
        verbose_name_plural = '学习记录'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_log_type_display()} - {self.action}"


class StudyGoal(models.Model):
    """学习目标"""
    title = models.CharField(max_length=200, verbose_name='目标标题')
    description = models.TextField(blank=True, verbose_name='目标描述')
    target_words = models.IntegerField(default=0, verbose_name='目标单词数')
    target_sentences = models.IntegerField(default=0, verbose_name='目标句子数')
    target_grammar = models.IntegerField(default=0, verbose_name='目标语法数')
    start_date = models.DateField(verbose_name='开始日期')
    end_date = models.DateField(verbose_name='结束日期')
    is_active = models.BooleanField(default=True, verbose_name='进行中')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    
    class Meta:
        verbose_name = '学习目标'
        verbose_name_plural = '学习目标'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
