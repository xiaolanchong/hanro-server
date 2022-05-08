from datetime import datetime
from collections import namedtuple
from stardictsajeon import StardictRuSajeon
import sqlite3
import typing
from pathlib import Path


SimpleArticle = namedtuple('SimpleArticle', ['word', 'order', 'definition'])

incorrect_format_words = {
    '강기': """강기 剛氣
""",
    '고사':
    """고사 
...은 ~하고 не говоря о чем, оставляя в стороне что

고사 古事
древние обычаи; историческое событие; древнее событие; события давно минувших дней

고사 古史
древняя история

고사 古寺
древний храм, древний монастырь

고사 告祀
жертвоприношение духам с мольбой о предотвращении несчастий
~를 지내다 (올리다) совершать жертвоприношение духам и молить о предотвращении несчастья

고사 固辭
абсолютный отказ
~하다 отказать наотрез

고사 故事
1. источник; начало; происхождение
2. исторический факт
~를 인용하다 ссылаться на исторический факт
3. фольклор

고사 枯死
~하다 засохнуть, высохнуть на корню
~한 나무 засохшее дерево

고사 考査
экзамен; испытание, проба, проверка
기말 ~ сессия

고사 高士
благородный, великодушный человек""",
    '애호가':
    """애호가 愛好家
любитель; почитатель; поклонник; болельщик""",
    '야차': """야차 夜叉
(будд.) якша (женское демоническое существо)""",
    '형': """형 兄
старший брат
~만한 아우 없다 Старший брат во всём первый.

형 刑
= 형벌

형 型
образец; тип; форма

형 形
форма; вид; облик"""}


def get_articles(max_words: int) -> typing.List[SimpleArticle]:
    dictionary = StardictRuSajeon()
    article_list = []
    for index, word in enumerate(dictionary.get_all_words()):
        if max_words is not None and index >= max_words:
            break
        if word in incorrect_format_words:
            article = incorrect_format_words[word]
        else:
            article = dictionary.get_definition(word, add_examples=True)
        sections = article.split('\n\n')
        for order, section in enumerate(sections):
            article_list.append(SimpleArticle(word=word, order=order, definition=section))

    return article_list


def dump_to_db(article_list: typing.List[SimpleArticle]):
    dict_path = Path('./../../../hanro-dict.db')
    bot_id = 2
    checked = False
    visible = False
    now = datetime.utcnow()
    with sqlite3.connect(str(dict_path.absolute())) as con:
        data = ((article.word, article.order, article.definition, now, bot_id, checked, visible)
                for article in article_list)
        con.executemany("insert into word(word, 'order', definition, last_edited, last_edited_by_user, "
                        "checked, visible) "
                        "values (?, ?, ?, ?, ?, ?, ?)", data)


articles = get_articles(10000)
dump_to_db(articles)
