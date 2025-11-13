"""
Simple matching service for jobs - placeholder for future AI integration
"""
from typing import List, Dict
import json


def match_jobs_to_user(user_skills: List[int], jobs: List[Dict]) -> List[Dict]:
    """
    Simple rule-based matcher that scores jobs by number of overlapping skills.
    - user_skills: list of skill ids the user has
    - jobs: list of job dicts (each job may contain required_skills as JSON string or list)

    Returns the jobs sorted by overlap score (descending) and includes a _match_score and _matched_skills list.
    """
    if not user_skills:
        return jobs

    user_set = set(int(s) for s in user_skills)
    results = []
    for job in jobs:
        req = job.get('required_skills') or job.get('requiredSkills')
        # normalize required skills to list of ints
        if isinstance(req, str):
            try:
                req_list = json.loads(req)
            except Exception:
                req_list = []
        elif isinstance(req, list):
            req_list = req
        else:
            req_list = []

        req_set = set(int(s) for s in req_list if s is not None)
        matched = list(user_set.intersection(req_set))
        score = len(matched)

        job_copy = dict(job)
        job_copy['_match_score'] = score
        job_copy['_matched_skills'] = matched
        results.append(job_copy)

    # sort by score desc
    results.sort(key=lambda j: j.get('_match_score', 0), reverse=True)
    return results
